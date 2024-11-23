import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Transaction } from '@sequelize/core';
import { Attribute, AutoIncrement, CreatedAt, DeletedAt, Index, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { compare, hash } from 'bcrypt';
import { CreateUserApi, MyUserApi, UserApi, UserRole } from '../../api/user';
import { assert, isPositiveInteger } from '../../utils/validate';
import { redisClient } from '../redis';

const saltRounds = 10;

class UserCache {
  async get(id: number): Promise<MyUserApi | undefined> {
    const result = await redisClient.get(`users:${id}`);
    if (result == null) return undefined;
    return JSON.parse(result);
  }

  async set(user: MyUserApi | undefined): Promise<void> {
    if (user == null) return;
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
  declare deletedAt?: Date;

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
    }, { transaction });
    return newUser;
  }
}

