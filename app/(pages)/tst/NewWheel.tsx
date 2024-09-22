import * as PIXI from "pixi.js";
import { Graphics, PixiComponent, Stage, useTick, Container, Text, applyDefaultProps } from "@pixi/react";
import React, {
    Fragment,
    StrictMode,
    use,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

const TAU = Math.PI * 2;

function genColor(num: number): string[] {
    // generate random colors using golden ratio to avoid colors being too close to eachother
    const gRatio = 0.618033988749895;
    let h = Math.random(); // starting random seed
    let r = [];
    for (var i = 0; i < num; i++) {
        h += gRatio;
        h %= 1; // Keep the number below 1, discarding the 1 when it grows past it
        r.push(hsv_to_rgb(h, Math.random() * 0.4 + 0.35, Math.random() * 0.1 + 0.89));
    }
    return r;
}

function hsv_to_rgb(h: number, s: number, v: number) {
    // convert hsv to rgb and return the hex value
    let h_i, f, p, q, t;
    let r = 0,
        g = 0,
        b = 0;

    h_i = Number.parseInt((h * 6).toString());
    f = h * 6 - h_i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    if (h_i === 0) {
        r = v;
        g = t;
        b = p;
    }
    if (h_i === 1) {
        r = q;
        g = v;
        b = p;
    }
    if (h_i === 2) {
        r = p;
        g = v;
        b = t;
    }
    if (h_i === 3) {
        r = p;
        g = q;
        b = v;
    }
    if (h_i === 4) {
        r = t;
        g = p;
        b = v;
    }
    if (h_i === 5) {
        r = v;
        g = p;
        b = q;
    }
    return (
        "#" +
        Number.parseInt((r * 256).toString()).toString(16) +
        Number.parseInt((g * 256).toString()).toString(16) +
        Number.parseInt((b * 256).toString()).toString(16)
    );
}

const Rueda = ({
    ancho,
    alto,
    participantes,
    total,
}: {
    ancho: number;
    alto: number;
    participantes: Segment[];
    total: number;
}) => {
    const ref = useRef();
    const centroX = useMemo(() => ancho / 2, [ancho]);
    const centroY = useMemo(() => alto / 2, [alto]);
    const radio = useMemo(() => Math.min(centroX, centroY), [centroX, centroY]);
    const colores = useMemo(() => genColor(10000), []);
    const [rotacion, setRotacion] = useState(0);
    const [ganador, setGanador] = useState("");
    const [agarrado, setAgarrado] = useState(false);

    const tamanioFuente = ancho < 700 ? 16 : ancho < 900 ? 26 : 36;

    // useTick((delta, { FPS = 60 }) => {
    //     setRotacion((rotacion + delta / 100) % TAU);
    // });

    const handleClick = useCallback(() => {
        console.log("click");
    }, []);

    useEffect(() => {
        const currentAngle = TAU - rotacion;
        const winner = participantes.find((p) => currentAngle >= p.comienzo! && currentAngle <= p.fin!);
        if (winner) setGanador(winner.name);
    }, [rotacion]);
    const partes = useMemo(
        () =>
            participantes.map((p, indice) => (
                <Porcion
                    key={p.id}
                    name={p.name}
                    x={centroX}
                    y={centroY}
                    radius={radio}
                    startAngle={p.comienzo}
                    endAngle={p.fin}
                    color={colores[indice]}
                />
            )),
        [participantes, centroX, centroY, radio, colores]
    );
    return (
        <Container click={handleClick} ref={ref.current}>
            <Container rotation={rotacion} pivot={[centroX, centroY]} position={[centroX, centroY]}>
                {partes}
            </Container>
            <Container>
                <Aguja radio={Math.min(ancho, alto) / 2} centroX={centroX} centroY={centroY} />
                <Text
                    text={ganador}
                    x={centroX + radio + 50}
                    y={centroY - 23}
                    style={new PIXI.TextStyle({ fill: "black", fontSize: tamanioFuente })}
                />
            </Container>
        </Container>
    );
};
const DibujoPorcion = ({ ...props }) => {
    const instancia = useRef<PIXI.Graphics>(new PIXI.Graphics());
    const { x, y, radius, startAngle, endAngle, color } = props;
    useEffect(() => {
        instancia.current.clear();
        instancia.current.beginFill(color);
        instancia.current.moveTo(x, y);
        instancia.current.arc(x, y, radius, startAngle, endAngle);
        instancia.current.lineTo(x, y);
        instancia.current.endFill();
    }, [x, y, radius, startAngle, endAngle, color]);
    return <Graphics ref={instancia} />;
};

const Porcion = ({ name, ...props }: { name: string; [key: string]: any }) => {
    const ref = useRef();
    const { x, y, radius, startAngle, endAngle, color } = props;
    const angulo = endAngle - startAngle;
    return (
        <Container ref={ref.current}>
            <DibujoPorcion x={x} y={y} radius={radius - 10} startAngle={startAngle} endAngle={endAngle} color={color} />
            {angulo > 0.13 && (
                <Text
                    text={name}
                    x={x}
                    y={y}
                    rotation={angulo / 2 + startAngle}
                    pivot={[-radius + Math.min(250, name.length * 16) + 20, 18]}
                />
            )}
        </Container>
    );
};

const Aguja = PixiComponent<{ radio: number; centroX: number; centroY: number }, PIXI.Graphics>("Aguja", {
    create: () => new PIXI.Graphics(),
    applyProps: (instancia, _, propiedades) => {
        const puntaAguja = propiedades.centroX + propiedades.radio;
        instancia.clear();
        instancia.beginFill(0xffffff);
        instancia.drawCircle(propiedades.centroX, propiedades.centroY, 40);
        instancia.endFill();
        instancia.lineStyle(2, 0x000000, 1);
        instancia.beginFill(0xffffff);
        instancia.moveTo(puntaAguja - 20, propiedades.centroY);
        instancia.lineTo(puntaAguja + 30, propiedades.centroY - 10);
        instancia.lineTo(puntaAguja + 30, propiedades.centroY + 10);
        instancia.lineTo(puntaAguja - 20, propiedades.centroY);
        instancia.endFill();
    },
});

const NewWheel = ({
    entradas,
    callback,
    cerrando,
    totalEntradas,
}: {
    entradas: User[];
    callback: Function;
    cerrando: Boolean;
    totalEntradas: number;
}) => {
    const [ancho, setAncho] = useState(window.innerWidth / 2);
    const [alto, setAlto] = useState((window.innerHeight * 5) / 6);
    const estaCambiando = useRef(false);

    useLayoutEffect(() => {
        const manejarCambio = () => {
            setAncho(window.innerWidth / 2);
            setAlto((window.innerHeight * 5) / 6);
        };

        window.addEventListener("resize", () => {
            if (!estaCambiando.current) {
                estaCambiando.current = true;
                manejarCambio();
                setTimeout(() => {
                    estaCambiando.current = false;
                }, 10);
            }
        });

        window.addEventListener("DOMContentLoaded", manejarCambio);

        return () => {
            window.removeEventListener("resize", manejarCambio);
            window.removeEventListener("DOMContentLoaded", manejarCambio);
        };
    }, []);

    const lista = entradas.reduce<Segment[]>((acc, entrada, indice) => {
        const anchoPorcion = TAU * (entrada.ammount / totalEntradas);
        const comienzo = indice === 0 ? 0 : acc[indice - 1].fin!;
        const fin = comienzo + anchoPorcion;

        return [...acc, { ...entrada, comienzo, fin }];
    }, []);

    return (
        <div className="bg-black flex justify-center my-2">
            <Stage width={ancho * 1.4} height={alto} options={{ backgroundColor: 0xa1a1a1 }}>
                <Rueda alto={alto} ancho={ancho} participantes={lista} total={totalEntradas} />
            </Stage>
        </div>
    );
};

export default NewWheel;
