import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from '@sequelize/core';
import { Attribute, AutoIncrement, CreatedAt, DeletedAt, Index, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { compare, hash } from 'bcrypt';
import { NotificationFrequency, NotificationMethod, NotificationPreferences } from '../../api/notifications';
import { CreateUserApi, MyUserApi, UserApi, UserRole } from '../../api/user';
import { assert, isPositiveInteger } from '../../utils/validate';
import { redisClient } from '../redis';
import { emailService } from '../util/email';
import { environment, Stage } from '../util/environment';
import { Lifecycle } from '../util/lifecycle';

const saltRounds = 10;

class UserCache {
  async get(id: number): Promise<MyUserApi | undefined> {
    if (environment.stage == Stage.enum.development) return;
    const result = await redisClient.get(`users:${id}`);
    if (result == null) return undefined;
    return JSON.parse(result);
  }

  async set(user: MyUserApi | undefined): Promise<void> {
    if (user == null) return;
    if (environment.stage == Stage.enum.development) return;
    await redisClient.set(`users:${user.id}`, JSON.stringify(user), { PX: 360000 });
  }
}

const userCache = new UserCache();

@Table({ modelName: 'User' })
export class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  @AutoIncrement
  @PrimaryKey
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Index({ unique: true })
  @Attribute(DataTypes.STRING)
  declare username: string;

  @Index({ unique: true })
  @Attribute(DataTypes.STRING)
  declare email: string;

  @Attribute(DataTypes.STRING)
  declare password: string;

  @Attribute(DataTypes.STRING)
  declare role: UserRole;

  @Attribute(DataTypes.JSONB)
  declare notificationPreferences: NotificationPreferences;

  @Version
  @NotNull
  declare internalVersion: CreationOptional<number>;

  @CreatedAt
  @NotNull
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @NotNull
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt?: Date | null;

  // Helper methods

  static async getUser(pk: number): Promise<MyUserApi | undefined> {
    assert(isPositiveInteger(pk));
    const result = await userCache.get(pk);
    if (result != null) return result;

    const user = await UserModel.findByPk(pk);
    if (!user) return undefined;
    const asApi = user.toMyApi();
    await userCache.set(asApi);
    return asApi;
  }

  getTurnNotificationMethod(frequency: NotificationFrequency): NotificationMethod | undefined {
    return this.notificationPreferences.turnNotifications.find((preference) => preference.frequency === frequency)?.method;
  }

  updateCache() {
    userCache.set(this);
  }

  static toApi(user: MyUserApi): UserApi {
    return {
      id: user.id,
      username: user.username,
    };
  }

  toApi(): UserApi {
    return UserModel.toApi(this);
  }

  toMyApi(): MyUserApi {
    return {
      ...this.toApi(),
      email: this.email,
      role: this.role,
    };
  }


  comparePassword(password: string): Promise<boolean> {
    return compare(password, this.password);
  }

  static hashPassword(password: string): Promise<string> {
    return hash(password, saltRounds);
  }

  static async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserModel | null> {
    if (usernameOrEmail.indexOf('@') != -1) {
      return UserModel.findOne({ where: { email: usernameOrEmail } });
    }
    return UserModel.findOne({ where: { username: usernameOrEmail } });
  }

  static async login(usernameOrEmail: string, password: string): Promise<UserModel | null> {
    const user = await this.findByUsernameOrEmail(usernameOrEmail);
    if (user == null) {
      return null;
    }
    if (!(await user.comparePassword(password))) {
      return null;
    }
    return user;
  }

  static async register(user: CreateUserApi, transaction?: Transaction): Promise<UserModel> {
    const password = await UserModel.hashPassword(user.password);
    const newUser = await UserModel.create({
      username: user.username,
      email: user.email,
      password,
      role: UserRole.enum.ACTIVATE_EMAIL,
      notificationPreferences: {
        turnNotifications: [{
          method: NotificationMethod.EMAIL,
          frequency: NotificationFrequency.IMMEDIATELY,
        }],
        marketing: true,
      },
    }, { transaction });
    return newUser;
  }

  static async unsubscribe(email: string) {
    const user = await UserModel.findByUsernameOrEmail(email);
    assert(user != null, { invalidInput: true });
    await user.setNotificationPreferences({
      turnNotifications: [],
      marketing: false,
    });
  }

  async setNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    this.notificationPreferences = preferences;
    await Promise.all([
      emailService.setIsExcludedFromCampaigns(this.email, preferences.marketing),
      this.save(),
    ]);
  }
}


Lifecycle.singleton.onStart(() => {
  function updateUserCache(user: UserModel) {
    userCache.set(user.toMyApi());
  }
  return UserModel.hooks.addListener('afterSave', updateUserCache);
});

