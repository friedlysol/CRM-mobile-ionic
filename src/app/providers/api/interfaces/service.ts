/* eslint-disable @typescript-eslint/naming-convention */
export interface IService {
    id: number;
    category_type_id: number;
    name: string;
    description?: string;
    require_comment: number;
    options: string;
    enabled: number;
    hash: string;
}
