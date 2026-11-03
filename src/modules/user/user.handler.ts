import type {
    Request,
    Response
} from 'express';

import type { RegisterUserInput } from './user.model.js';

import { GetUserByIdUseCase, RegisterUserUseCase } from './user.usecase.js';

export class UserHandler {

    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase
    ) {}

    register = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const input = req.body as RegisterUserInput;

        const user = await this.registerUserUseCase.execute(
            input
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: user
        });
    };
getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Validasi ID yang masuk
    if (!id || typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Format ID user tidak valid atau kosong"
      });
      return;
    }

    // 2. Panggil UseCase untuk cari user ke database
    const user = await this.getUserByIdUseCase.execute(id);

    // 3. Jika user tidak ditemukan di database
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
      return;
    }

    // 4. Jika sukses berhasil ditemukan
    res.status(200).json({
      success: true,
      message: "User ditemukan",
      data: user
    });

  } catch (error: any) {
    // Menangkap error jika database atau sistem crash agar server tidak mati
    console.error("Terjadi error di Handler:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};
}