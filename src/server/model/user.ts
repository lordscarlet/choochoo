import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, CreatedAt, DeletedAt, Index, NotNull, PrimaryKey, Table, UpdatedAt, Version } from '@sequelize/core/decorators-legacy';
import { compare, hash } from 'bcrypt';
import { CreateUserApi, MyUserApi, UserApi } from '../../api/user';

const saltRounds = 10;

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

  @Version
  @NotNull
  declare internalVersion: CreationOptional<number>;

  @CreatedAt
  declare createdDate: CreationOptional<Date>;

  @UpdatedAt
  declare updatedDate: CreationOptional<Date>;

  @DeletedAt
  declare deletedDate?: Date;

  // Helper methods

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
    });
    return newUser;
  }
}

