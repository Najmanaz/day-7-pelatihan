import type {
    Request,
    Response
} from 'express';

import type { RegisterUserInput } from './user.model.js';

import type { GetAllUserUseCase } from './user.usecase.js';

import type { PaginationQuery } from '../../shared/pagination/pagination.validation.js';

import { createPaginationParams } from '../../shared/pagination/pagination.util.js'

import { GetUserByIdUseCase, RegisterUserUseCase, UpdateUserUseCase } from './user.usecase.js';

import type { UpdateUserData } from './user.model.js';

import { DeleteUserUseCase } from './user.usecase.js';
import { success } from 'zod';
import { th } from 'zod/locales';

export class UserHandler {

    constructor(
        private readonly registerUserUseCase: RegisterUserUseCase,
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly getAllUserUseCase: GetAllUserUseCase
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

  
  getAll = async(
    req: Request,
    res: Response
  ): Promise<void> => {

    const query = res.locals.validatedQuery as PaginationQuery;

    const params = createPaginationParams(
      query.page,
      query.limit
    );

    const result = await this.getAllUserUseCase.execute(
      params
    );

    res.status(200).json({
      success: true,
      message: 'Data users berhasil ditemukan',
      data: result.data,
      pagination: result.pagination
    }

    )};


  getUserById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id as string;

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

update = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const id = req.params.userId as string;
    const input = req.body as UpdateUserData;

    const user = await this.updateUserUseCase.execute(
      id,
      input
    );

    res.status(200).json({
      success: true,
      message: 'User berhasil diperbarui',
      data: user
    });
  
    }

  delete = async (
    req: Request,
    res: Response
  ): Promise<void> => {

    const id = req.params.id as string;

    await this.deleteUserUseCase.execute(id);

    res.status(200).json({
      success: true,
      message: 'User berhasil dihapus'
    });
  }
  };