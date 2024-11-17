import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, CreatedAt, DeletedAt, Index, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { compare, hash } from 'bcrypt';
import { CreateUserApi, MyUserApi, UserApi, UserRole } from '../../api/user';
import { assert, isPositiveInteger } from '../../utils/validate';

const saltRounds = 10;

const userCache = new Map<number, UserModel | undefined>();

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

  @Attribute(DataTypes.ENUM(UserRole.options))
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

  static async getUser(pk: number): Promise<UserModel | undefined> {
    assert(isPositiveInteger(pk));
    if (!userCache.has(pk)) {
      userCache.set(pk, (await UserModel.findByPk(pk)) ?? undefined);
    }
    return userCache.get(pk)!;
  }

  toApi(): UserApi {
    return {
      id: this.id,
      username: this.username,
    };
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

  static async register(user: CreateUserApi): Promise<UserModel> {
    const password = await UserModel.hashPassword(user.password);
    const newUser = await UserModel.create({
      username: user.username,
      email: user.email,
      password,
      role: UserRole.enum.WAITLIST,
    });
    return newUser;
  }
}

