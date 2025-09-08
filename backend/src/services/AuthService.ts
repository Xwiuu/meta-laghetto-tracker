import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../database";

interface IAuthRequest {
  email: string;
  password: string;
}

interface IUser {
  id: string;
  name: string;
  password_hash: string;
}

class AuthService {
  public async execute({
    email,
    password,
  }: IAuthRequest): Promise<{ token: string }> {
    const { rows: users } = await pool.query<IUser>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = users[0];

    if (!user) {
      throw new Error("Email ou senha incorretos.");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      throw new Error("Email ou senha incorretos.");
    }

    const token = jwt.sign(
      { userId: user.id, userName: user.name },
      "seu_segredo_super_secreto_aqui",
      { expiresIn: "1d" }
    );

    return { token };
  }
}

export default AuthService;
