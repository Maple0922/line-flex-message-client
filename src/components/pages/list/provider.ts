import { ref, InjectionKey, reactive } from "vue";
import axios from "axios";
import {
  Day,
  Snackbar,
  RangeType,
  ClickedRow,
  DialogVisible,
  ReservationCreateForm,
  ReservationEditForm,
} from "@/types";

export const key: InjectionKey<ReturnType<typeof useProvide>> = Symbol("List");

export const useProvide = () => {
  const type = ref<RangeType>("d");
  const page = ref<number>(0);

  const day = ref<Day>({
    date: "",
    reservations: [],
  });

  const snackbar = reactive<Snackbar>({
    visible: false,
    color: "",
    text: "",
  });

  const days = ref<Day[]>([]);

  const dialogVisible = reactive<DialogVisible>({
    create: false,
    edit: false,
  });

  const clickedRow = reactive<ClickedRow>({
    date: "",
    time: 0,
  });

  const createForm = reactive<ReservationCreateForm>({
    name: "",
    date: "",
    time: {
      start: { hour: 0, minute: 0 },
      end: { hour: 0, minute: 0 },
    },
    code: "",
  });

  const editForm = reactive<ReservationEditForm>({
    id: 0,
    name: "",
    date: "",
    time: {
      start: { hour: 0, minute: 0 },
      end: { hour: 0, minute: 0 },
    },
    code: "",
  });

  const createRange = ref<number>(2);
  const editRange = ref<number>(2);

  const shiftTime = (diffMinute: 30 | -30, type: "create" | "edit") => {
    const start =
      type === "create" ? createForm.time.start : editForm.time.start;
    const end = type === "create" ? createForm.time.end : editForm.time.end;
    if (
      (end.hour >= 22 && end.minute === 0 && diffMinute === 30) ||
      (start.hour <= 8 && start.minute === 0 && diffMinute === -30)
    ) {
      return;
    }

    const startHour =
      diffMinute === 30 && start.minute === 30
        ? start.hour + 1
        : diffMinute === -30 && start.minute === 0
        ? start.hour - 1
        : start.hour;

    const endHour =
      diffMinute === 30 && end.minute === 30
        ? end.hour + 1
        : diffMinute === -30 && end.minute === 0
        ? end.hour - 1
        : end.hour;

    const startMinute = start.minute === 30 ? 0 : 30;
    const endMinute = end.minute === 30 ? 0 : 30;

    const newTime = {
      start: { hour: startHour, minute: startMinute },
      end: { hour: endHour, minute: endMinute },
    };

    type === "create"
      ? Object.assign(createForm.time, newTime)
      : Object.assign(editForm.time, newTime);
  };

  const fetchReservations = async () => {
    const { data } = await axios.get<Day[]>("/reserve", {
      params: {
        t: type.value,
        p: page.value,
      },
    });
    days.value = data;
    day.value = data[0];
  };

  const setSnackbar = (color: string, text: string) => {
    Object.assign(snackbar, {
      visible: true,
      color,
      text,
    });
  };

  return {
    type,
    page,
    snackbar,
    days,
    day,
    dialogVisible,
    clickedRow,
    createForm,
    editForm,
    createRange,
    editRange,
    shiftTime,
    fetchReservations,
    setSnackbar,
  };
};
