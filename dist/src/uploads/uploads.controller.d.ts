import { ListUploadsDto } from "./dto/list-uploads.dto";
import { UploadFileDto } from "./dto/upload-file.dto";
import { UploadsService } from "./uploads.service";
export declare class UploadsController {
    private readonly uploadsService;
    private readonly logger;
    constructor(uploadsService: UploadsService);
    upload(user: {
        id: string;
    }, dto: UploadFileDto, file: Express.Multer.File): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.UploadType;
        size: number;
        createdAt: Date;
        originalName: string;
        storedPath: string;
        mimeType: string;
        userId: string;
    }>;
    listMine(user: {
        id: string;
    }, query: ListUploadsDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.UploadType;
        size: number;
        createdAt: Date;
        originalName: string;
        storedPath: string;
        mimeType: string;
        userId: string;
    }[]>;
    listAll(query: ListUploadsDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.UploadType;
        size: number;
        createdAt: Date;
        originalName: string;
        storedPath: string;
        mimeType: string;
        userId: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.UploadType;
        size: number;
        createdAt: Date;
        originalName: string;
        storedPath: string;
        mimeType: string;
        userId: string;
    } | null>;
}
