export interface ResponseTypeApiInterface {
  response: {
    types: TypeApiInterface[];
  };
}

export interface TypeApiInterface {
  id: number;
  type_id: number;
  type: string;
  type_key: string;
  type_value: string;
  orderby: number;
  color: string;
  hash: string;
}
