import * as PIXI from "pixi.js";
import { Graphics, Container, Text, Application } from "pixi.js";
import React, { useEffect, useCallback, useMemo, useRef, useState } from "react";

const TAU = Math.PI * 2;
const winSFX = new Audio("/assets/tada.mp3");
const tickSFX = new Audio("/assets/tick.mp3");
const FRICCION = 0.00002;

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
    // useExtend({ Container, Graphics, Text });
    // const [ancho, setAncho] = useState(window.innerWidth / 2);
    // const [alto, setAlto] = useState((window.innerHeight * 5) / 6);
    // const estaCambiando = useRef(false);

    // // useLayoutEffect(() => {
    // //     const manejarCambio = () => {
    // //         setAncho(window.innerWidth / 2);
    // //         setAlto((window.innerHeight * 5) / 6);
    // //     };

    // //     window.addEventListener("resize", () => {
    // //         if (!estaCambiando.current) {
    // //             estaCambiando.current = true;
    // //             manejarCambio();
    // //             setTimeout(() => {
    // //                 estaCambiando.current = false;
    // //             }, 10);
    // //         }
    // //     });

    // //     window.addEventListener("DOMContentLoaded", manejarCambio);

    // //     return () => {
    // //         window.removeEventListener("resize", manejarCambio);
    // //         window.removeEventListener("DOMContentLoaded", manejarCambio);
    // //     };
    // // }, []);

    const lista = useMemo(
        () =>
            entradas.reduce<Segment[]>((acc, entrada, indice) => {
                const anchoPorcion = TAU * (entrada.ammount / totalEntradas);
                const comienzo = indice === 0 ? 0 : acc[indice - 1].fin!;
                const fin = comienzo + anchoPorcion;
                const longitudNombre = entrada.name.length;
                const shortName = longitudNombre > 11 ? entrada.name.substring(0, 8) + "..." : entrada.name;
                return [...acc, { ...entrada, comienzo, fin, shortName }];
            }, []),
        [entradas]
    );

    // const Rueda = ({ participantes }: { participantes: Segment[] }) => {
    //     const { app } = useApplication();

    //     const ancho = app.stage.width;
    //     const alto = app.stage.height;
    //     const centroX = useMemo(() => ancho / 2, [ancho]);
    //     const centroY = useMemo(() => alto / 2, [alto]);
    //     const radio = useMemo(() => Math.min(centroX, centroY), [centroX, centroY]);
    //
    //     useEffect(() => console.log(app.canvas.height), [app.canvas.height]);
    //     const rotacion = useRef(0);
    //     const [ganador, setGanador] = useState({ name: "", id: "" });
    //     const [velocidad, setVelocidad] = useState(0);
    //     const [girando, setGirando] = useState(false);
    //     const [paro, setParo] = useState(false);
    //     const tamanioFuente = ancho < 700 ? 16 : ancho < 900 ? 20 : 26;
    //     const [startTime, setStartTime] = useState(0);
    //     const [FPS, setFPS] = useState(0);

    //     useTick((delta) => {
    //         // if (delta.deltaTime > 1.6) console.log("Long frame: ", delta.deltaTime, delta.FPS);
    //         if (velocidad <= 0) {
    //             setParo(true);
    //             setGirando(false);
    //         }
    //         const deltaRotacion = velocidad - FRICCION * delta.deltaTime;
    //         const rotAng = (rotacion.current + deltaRotacion) % TAU;
    //         // if (velocidad < deltaRotacion) {
    //         //     console.log(
    //         //         `Delta rotacion: ${deltaRotacion} > Velocidad: ${velocidad}\nDelta: ${delta.deltaTime}\nFPS: ${delta.FPS}`
    //         //     );
    //         // }
    //         rotacion.current = rotAng;
    //         const currentAngle = TAU - rotacion.current;
    //         const winner = participantes.find((p) => currentAngle >= p.comienzo! && currentAngle <= p.fin!);
    //         if (winner && winner.id !== ganador.id) {
    //             setGanador(winner);
    //             tickSFX.play();
    //         }
    //         setFPS(delta.FPS);
    //         setVelocidad(deltaRotacion);
    //     }, girando);

    //     const tirar = () => {
    //         if (!girando) {
    //             tickSFX.volume = 0.25;
    //             setGirando(true);
    //             setStartTime(performance.now());
    //             const vel = Math.random() * 0.02 + 0.03;
    //             console.log("Speed: ", vel);
    //             setVelocidad(vel);
    //         }
    //     };

    //     useEffect(() => {
    //         if (paro) {
    //             winSFX.volume = 0.25;
    //             winSFX.play();
    //             callback(ganador.id);
    //             console.log("Time spinning: ", (performance.now() - startTime) / 1000);
    //             setParo(false);
    //         }
    //     }, [paro]);

    //     return (
    //         <>
    //             <container
    //                 eventMode={"dynamic"}
    //                 onClick={tirar}
    //                 rotation={rotacion.current}
    //                 pivot={new PIXI.Point(radio + 10, centroY)}
    //                 position={new PIXI.Point(radio + 10, centroY)}
    //                 isRenderGroup={true}>
    //                 {useMemo(
    //                     () =>
    //                         participantes.map((p, indice) => (
    //                             <Porcion
    //                                 key={p.id}
    //                                 name={p.shortName}
    //                                 x={radio + 10}
    //                                 y={centroY}
    //                                 radius={radio}
    //                                 startAngle={p.comienzo}
    //                                 endAngle={p.fin}
    //                                 color={colores[indice % colores.length]}
    //                             />
    //                         )),
    //                     [participantes, centroX, centroY, radio, colores]
    //                 )}
    //             </container>
    //             <container>
    //                 <graphics
    //                     draw={(instancia) => {
    //                         const puntaAguja = 2 * radio - 10;
    //                         instancia.circle(radio + 10, centroY, 40);
    //                         instancia.fill(0xffffff);
    //                         instancia.moveTo(puntaAguja, centroY);
    //                         instancia.lineTo(puntaAguja + 40, centroY - 10);
    //                         instancia.lineTo(puntaAguja + 40, centroY + 10);
    //                         instancia.lineTo(puntaAguja, centroY);
    //                         instancia.fill(0xffffff);
    //                         instancia.stroke({ width: 3, color: 0x000000 });
    //                     }}
    //                 />
    //                 <pixiText
    //                     text={ganador.name}
    //                     x={2 * radio + 45}
    //                     y={centroY - 18}
    //                     style={new PIXI.TextStyle({ fill: "white", fontSize: tamanioFuente })}
    //                 />
    //                 <pixiText text={`Vel: ${velocidad}\nFPS: ${FPS}`} />

    //                 <pixiText text={``} />
    //             </container>
    //         </>
    //     );
    // };

    // const Porcion = ({ name, ...props }: { name: string; [key: string]: any }) => {
    //     const { x, y, radius, startAngle, endAngle, color } = props;
    //     const angulo = endAngle - startAngle;
    //     const tamanioTexto = angulo > 0.14 ? 26 : 20;
    //     const puntoPivot = new PIXI.Point(
    //         -radius + Math.min(220, name.length * 16) - (angulo > 0.14 ? 20 : 56),
    //         angulo > 0.14 ? 18 : 14
    //     );

    //     const porcion = (instancia: PIXI.Graphics) => {
    //         // instancia.current.clear();
    //         instancia.moveTo(x, y);
    //         instancia.arc(x, y, radius, startAngle, endAngle);
    //         instancia.lineTo(x, y);
    //         instancia.fill(color);
    //     };
    //     return (
    //         <container>
    //             <graphics draw={porcion} />
    //             {angulo > 0.08 && (
    //                 <pixiText
    //                     text={name}
    //                     x={x}
    //                     y={y}
    //                     rotation={angulo / 2 + startAngle}
    //                     pivot={puntoPivot}
    //                     style={new PIXI.TextStyle({ fontSize: tamanioTexto })}
    //                 />
    //             )}
    //         </container>
    //     );
    // };

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const parentRef = useRef<HTMLDivElement>(null);
    const colores = useMemo(() => genColor(entradas.length % 10 === 1 ? 11 : 10), []);
    const init = useCallback(async () => {
        const canvas = canvasRef.current;
        const app = new Application();
        await app.init({ resizeTo: parentRef.current!, canvas: canvas!, background: 0x1e293b });
        shapes(app);
        return app;
    }, []);

    const shapes = useCallback((app: Application) => {
        const container = new Container({
            isRenderGroup: true,
            eventMode: "dynamic",
            width: app.renderer.width,
            height: app.renderer.height,
        });
        const centroX = app.renderer.width / 2;
        const centroY = app.renderer.height / 2;
        lista.map((p, indice) => {
            const graphics = new Graphics();
            const startAngle = p.comienzo!;
            const endAngle = p.fin!;
            const color = colores[indice % colores.length];
            const angulo = endAngle - startAngle;
            const tamanioTexto = angulo > 0.14 ? 26 : 20;
            const puntoPivot = new PIXI.Point(
                -100 + Math.min(220, p.shortName.length * 16) - (angulo > 0.14 ? 20 : 56),
                angulo > 0.14 ? 18 : 14
            );
            graphics.moveTo(centroX, centroY);
            graphics.arc(centroX, centroY, 200, startAngle, endAngle);
            graphics.lineTo(centroX, centroY);
            graphics.fill(color);
            container.addChild(graphics);
            if (angulo > 0.08) {
                const text = new Text(p.shortName, {
                    fontSize: tamanioTexto,
                    fill: "white",
                    // pivot: puntoPivot,
                    // rotation: angulo / 2 + startAngle,
                });
                container.addChild(text);
            }
        });
        // container.position.set(centroX, centroY);
        // container.pivot.set(centroX, centroY);
        app.stage.addChild(container);
    }, []);

    useEffect(() => {
        const app = init();
        return () => {
            app.then((a) => a.stop());
        };
    }, [init]);

    return (
        <div className="w-full h-full  " ref={parentRef}>
            <canvas ref={canvasRef} />
        </div>
    );

    // return (
    //     <div className="w-full h-full" ref={thisRef}>
    //         <Application background={0x1e293b} resizeTo={thisRef}>
    //             {/* <container width={ancho} height={alto}> */}
    //             <Rueda participantes={lista} />
    //             {/* </container> */}
    //         </Application>
    //     </div>
    // );
};

export default Wheel;
