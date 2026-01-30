import { ListTtsDto } from "./dto/list-tts.dto";
import { TtsService } from "./tts.service";
export declare class TtsController {
    private readonly ttsService;
    constructor(ttsService: TtsService);
    create(scriptId: string): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    }>;
    listMine(user: {
        id: string;
    }, query: ListTtsDto): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    }[]>;
    listAll(query: ListTtsDto): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        createdAt: Date;
        storedPath: string;
        scriptId: string;
    } | null>;
}
