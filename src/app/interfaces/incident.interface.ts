export interface IncidentInterface {
  uuid?: string;
  id?: number;
  incident_type_id: number;
  incident_date: string;
  incident_time: string;
  incident_location: string;
  description: string;
  injury_persons?: InjuryPersonInterface[];
  injury_description?: string;
  analysis_root_cause_type_id?: number;
  analysis_risk_type_id?: number;
  analysis_activity_being_performed_type_id?: number;
  analysis_corrective_action_description?: string;
  damage_property_owner?: string;
  damage_description?: string;
  damage_cause?: string;
  person_involved?: IncidentPerson[];
  status_type_id?: number;
  witnesses?: WitnessInterface[];
  note?: string;
  hash?: string;
  sync?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InjuryPersonInterface extends IncidentPerson {
  injury_type_id: number;
  body_part_id: number[];
  treatment_type_id: number;
}

export interface WitnessInterface extends IncidentPerson {
  statement?: string;
}

export interface IncidentPerson {
  first_name: string;
  last_name: string;
  phone_number?: string;
  email?: string;
}
