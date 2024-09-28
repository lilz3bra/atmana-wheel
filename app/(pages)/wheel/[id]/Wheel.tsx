import * as PIXI from "pixi.js";
import { Graphics, PixiComponent, Stage, useTick, Container, Text } from "@pixi/react";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

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

const Wheel = ({
    entradas,
    callback,
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

    const lista = useMemo(
        () =>
            entradas.reduce<Segment[]>((acc, entrada, indice) => {
                const anchoPorcion = TAU * (entrada.ammount / totalEntradas);
                const comienzo = indice === 0 ? 0 : acc[indice - 1].fin!;
                const fin = comienzo + anchoPorcion;
                const longitudNombre = entrada.name.length;
                const shortName =
                    longitudNombre > 11
                        ? entrada.name.substring(0, 5) +
                          "..." +
                          entrada.name.substring(longitudNombre - 5, longitudNombre)
                        : entrada.name;
                return [...acc, { ...entrada, comienzo, fin, shortName }];
            }, []),
        [entradas]
    );

    const Rueda = ({ participantes }: { participantes: Segment[] }) => {
        const ref = useRef();
        const centroX = useMemo(() => ancho / 2, [ancho]);
        const centroY = useMemo(() => alto / 2, [alto]);
        const radio = useMemo(() => Math.min(centroX, centroY), [centroX, centroY]);
        const colores = useMemo(() => genColor(10000), []);
        const [rotacion, setRotacion] = useState(0);
        const [ganador, setGanador] = useState({ name: "", id: "" });
        const [velocidad, setVelocidad] = useState(0);
        const [girando, setGirando] = useState(false);
        const [paro, setParo] = useState(false);
        const FRICCION = useRef(1.002);
        const winSFX = useRef(new Audio("/assets/tada.mp3"));
        const tickSFX = useRef(new Audio("/assets/tick.mp3"));
        const time = useRef(0);
        const tamanioFuente = ancho < 700 ? 16 : ancho < 900 ? 20 : 26;

        useTick((delta) => {
            if (girando) {
                if (velocidad > 2000) {
                    setParo(true);
                    setGirando(false);
                }
                setRotacion((rotacion + delta / velocidad) % TAU);
                setVelocidad(velocidad * FRICCION.current);
            }
        });

        const tirar = () => {
            if (!girando) {
                time.current = performance.now();
                setGirando(true);
                setVelocidad(Math.floor(Math.random() * 15) + 5);
            }
        };

        useEffect(() => {
            const currentAngle = TAU - rotacion;
            const winner = participantes.find((p) => currentAngle >= p.comienzo! && currentAngle <= p.fin!);
            if (winner && winner.id !== ganador.id) {
                setGanador(winner);
                tickSFX.current.volume = 0.25;
                tickSFX.current.play();
            }
        }, [rotacion]);

        useEffect(() => {
            if (paro) {
                winSFX.current.volume = 0.25;
                winSFX.current.play();
                callback(ganador.id);

                setParo(false);
                console.log((performance.now() - time.current) / 1000);
            }
        }, [paro]);

        const partes = useMemo(
            () =>
                participantes.map((p, indice) => (
                    <Porcion
                        key={p.id}
                        name={p.shortName}
                        x={radio + 10}
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
            <Container interactive={true} click={tirar} ref={ref.current}>
                <Container rotation={rotacion} pivot={[radio + 10, centroY]} position={[radio + 10, centroY]}>
                    {partes}
                </Container>
                <Container>
                    <Aguja radio={radio} centroX={radio + 10} centroY={centroY} />
                    <Text
                        text={ganador.name}
                        x={2 * radio + 25}
                        y={centroY - 18}
                        style={new PIXI.TextStyle({ fill: "white", fontSize: tamanioFuente })}
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
                <DibujoPorcion
                    x={x}
                    y={y}
                    radius={radius - 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    color={color}
                />
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
            const puntaAguja = propiedades.centroX + propiedades.radio - 30;
            instancia.clear();
            instancia.beginFill(0xffffff);
            instancia.drawCircle(propiedades.centroX, propiedades.centroY, 40);
            instancia.endFill();
            instancia.lineStyle(2, 0x000000, 1);
            instancia.beginFill(0xffffff);
            instancia.moveTo(puntaAguja, propiedades.centroY);
            instancia.lineTo(puntaAguja + 40, propiedades.centroY - 10);
            instancia.lineTo(puntaAguja + 40, propiedades.centroY + 10);
            instancia.lineTo(puntaAguja, propiedades.centroY);
            instancia.endFill();
        },
    });

    return (
        <div className="flex justify-center my-2">
            <Stage width={ancho} height={alto} options={{ backgroundColor: 0x1e293b }}>
                <Rueda participantes={lista} />
            </Stage>
        </div>
    );
};

export default Wheel;
