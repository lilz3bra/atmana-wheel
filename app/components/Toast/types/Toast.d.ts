interface ToastProps {
    stack: ToastNotif[];
}
interface ToastNotif {
    text: string | null | undefined;
    timeout?: number;
    type: ResultType;
    link?: string;
}

type ResultType = "error" | "success" | "warning" | null;
