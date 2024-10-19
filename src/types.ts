export interface Reservation {
  id: number;
  name: string;
  time: {
    start: string;
    end: string;
  };
}

export interface Day {
  date: string;
  reservations: Reservation[];
}

export interface Snackbar {
  visible: boolean;
  color: string;
  text: string;
}

export type RangeType = "d" | "w";

export interface DialogVisible {
  create: boolean;
  edit: boolean;
}

export interface ClickedRow {
  date: string;
  time: number;
}

interface Time {
  hour: number;
  minute: number;
}
export interface ReservationCreateForm {
  name: string;
  date: string;
  time: {
    start: Time;
    end: Time;
  };
  code: string;
}

export interface ReservationEditForm extends ReservationCreateForm {
  id: number;
}
