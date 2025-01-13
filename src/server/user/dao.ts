import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from '@sequelize/core';
import { Attribute, AutoIncrement, CreatedAt, DeletedAt, Index, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { compare, hash } from 'bcrypt';
import { NotificationFrequency, NotificationPreferences, TurnNotificationSetting } from '../../api/notifications';
import { CreateUserApi, MyUserApi, UserApi, UserRole } from '../../api/user';
import { assert, isPositiveInteger } from '../../utils/validate';
import { emailService } from '../util/email';
import { Lifecycle } from '../util/lifecycle';
import { userCache } from './cache';

const saltRounds = 10;

@Table({ modelName: 'User' })
export class UserDao extends Model<InferAttributes<UserDao>, InferCreationAttributes<UserDao>> {
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
  declare deletedAt: Date | null;

  // Helper methods

  static async getUser(pk: number): Promise<MyUserApi | undefined> {
    assert(isPositiveInteger(pk));
    const result = await userCache.get(pk);
    if (result != null) return result;

    const user = await UserDao.findByPk(pk);
    if (!user) return undefined;
    const asApi = user.toMyApi();
    await userCache.set(asApi);
    return asApi;
  }

  getTurnNotificationSetting(frequency: NotificationFrequency): TurnNotificationSetting | undefined {
    return this.notificationPreferences.turnNotifications.find((preference) => preference.frequency === frequency);
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
    return UserDao.toApi(this);
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

  static async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserDao | null> {
    if (usernameOrEmail.indexOf('@') != -1) {
      return UserDao.findOne({ where: { email: usernameOrEmail } });
    }
    return UserDao.findOne({ where: { username: usernameOrEmail } });
  }

  static async login(usernameOrEmail: string, password: string): Promise<UserDao | null> {
    const user = await this.findByUsernameOrEmail(usernameOrEmail);
    if (user == null) {
      return null;
    }
    if (!(await user.comparePassword(password))) {
      return null;
    }
    return user;
  }

  static async register(user: CreateUserApi, transaction?: Transaction): Promise<UserDao> {
    const password = await UserDao.hashPassword(user.password);
    const newUser = await UserDao.create({
      username: user.username,
      email: user.email,
      password,
      role: UserRole.enum.ACTIVATE_EMAIL,
      notificationPreferences: {
        turnNotifications: [],
        marketing: true,
      },
    }, { transaction });
    return newUser;
  }

  static async unsubscribe(email: string) {
    const user = await UserDao.findByUsernameOrEmail(email);
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
  function updateUserCache(user: UserDao) {
    userCache.set(user.toMyApi());
  }
  return UserDao.hooks.addListener('afterSave', updateUserCache);
});

