import {DataTypes} from 'sequelize';
import {hash, compare} from 'bcrypt';
import { Column, CreatedAt, DeletedAt, Index, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { CreateUserApi, MyUserApi, UserApi } from '../../api/user';

const saltRounds = 10;

@Table({underscored: true})
export class UserModel extends Model<UserModel, CreateUserApi> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  id!: string;

  @Index({unique: true})
  @Column
  username!: string;
  
  @Index({unique: true})
  @Column
  email!: string;

  @Column
  password!: string;

  @CreatedAt
  createdDate!: Date;

  @UpdatedAt
  updatedDate!: Date;

  @DeletedAt
  deletedDate!: Date;

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

  static async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserModel|null> {
    if (usernameOrEmail.indexOf('@') != -1) {
      return UserModel.findOne({where: {email: usernameOrEmail}});
    }
    return UserModel.findOne({where: {username: usernameOrEmail}});
  }

  static async login(usernameOrEmail: string, password: string): Promise<UserModel|null> {
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
    console.log('about to create');
    const password = await UserModel.hashPassword(user.password);
    console.log('hashed password', password);
    const newUser = await UserModel.create({
      username: user.username,
      email: user.email,
      password,
    });
    return newUser;
  }
}

