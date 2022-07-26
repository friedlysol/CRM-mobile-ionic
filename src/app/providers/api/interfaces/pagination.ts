/* eslint-disable @typescript-eslint/naming-convention */
export interface IPagination<T> {
    current_page: number;
    from: number;
    last_page: number;
    next_page_url: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
    type_options?: any;

    data: T[];

    fields?: any;
    total_amount?: number;
}
