export interface ResponsePersonApiInterface {
  response: {
    persons: PersonApiInterface[];
  };
}

export interface PersonApiInterface {
  person_id: number;
  first_name: string;
  last_name: string;
  status_type_id: number;
  kind: string;
  type: string;
  hash: string;
  id: number;
  created_at: string;
}
