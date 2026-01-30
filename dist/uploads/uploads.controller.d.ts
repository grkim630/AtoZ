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
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    }>;
    listMine(user: {
        id: string;
    }, query: ListUploadsDto): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    }[]>;
    listAll(query: ListUploadsDto): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.UploadType;
        originalName: string;
        storedPath: string;
        size: number;
        mimeType: string;
        userId: string;
    } | null>;
}
