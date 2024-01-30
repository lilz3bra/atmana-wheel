import { useEffect, useRef, useState, useLayoutEffect } from "react";

export const Wheel = ({ entries, callback, closing }) => {
    const canvasRef = useRef(null);
    const firstRun = useRef(true);
    const firstDraw = useRef(true);
    const timerHandle = useRef(0);
    const timerDelay = 33;
    const angleCurrent = useRef(0);
    const angleDelta = useRef(0);

    const size = useRef(190);

    const segments = useRef();
    const seg_colors = useRef();
    const winner = useRef();
    const lastPointed = useRef();
    const isResizing = useRef(false);
    const [maxSpeed, setMaxSpeed] = useState(Math.PI / 8);
    const upTime = 2000; // Acceleration time (in ms)
    const downTime = useRef(70000); // Time to full stop (in ms)
    const spinStart = useRef(0);
    const centerX = useRef(200);
    const centerY = useRef(200);
    let totalCount = 0;

    const winSFX = new Audio("/assets/tada.mp3");
    const tickSFX = new Audio("/assets/tick.mp3");
    const [width, setWidth] = useState((window.innerWidth * 2) / 3);
    const [height, setHeight] = useState(window.innerHeight * (5 / 6));

    Object.keys(entries).forEach((name) => {
        totalCount += entries[name];
    });
    useLayoutEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth * 0.5);
            setHeight(window.innerHeight * (5 / 6));

            centerX.current = window.innerWidth * (2 / 3) - 100;
            centerY.current = (window.innerHeight * (5 / 6)) / 2;
            size.current = (window.innerHeight * (5 / 6)) / 2 - 10;
        };

        window.addEventListener("resize", () => {
            if (!isResizing.current) {
                isResizing.current = true;
                handleResize();
                setTimeout(() => {
                    draw();
                    isResizing.current = false;
                }, 10); // Adjust the debounce delay as needed
            }
        }); // Update window size on resize
        window.addEventListener("DOMContentLoaded", handleResize); // Set the initial window size

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("DOMContentLoaded", handleResize);
        };
    }, []);

    useEffect(() => {
        if (firstRun.current) {
            firstRun.current = false;
            init();
            if (segments.current.length > 0) {
                firstDraw.current = false;
                draw();
            }
        }
    });

    useEffect(() => {
        if (!closing) {
            return () => {
                clearInterval(timerHandle.current);
            };
        }
    }, [closing]);

    const init = () => {
        const canvas = canvasRef.current;
        // draw on the canvas here

        canvas.addEventListener("click", spin);
        segments.current = Object.entries(entries).map(([name, weight]) => ({
            username: name,
            count: weight,
            angle: (weight / totalCount) * Math.PI * 2,
        }));

        seg_colors.current = genColor(segments.current.length);
        angleCurrent.current = (0.5 / totalCount) * Math.PI * 2;
        centerX.current = window.innerWidth * 0.5 * (2 / 3) - 100;
        centerY.current = (window.innerHeight * (5 / 6)) / 2;
        size.current = (window.innerHeight * (5 / 6)) / 2 - 10;

        return () => {
            canvas.removeEventListener("click", spin);
        };
    };

    const spin = () => {
        // Start the wheel only if it's not already spinning
        if (timerHandle.current === 0) {
            downTime.current = Math.floor(25000 + Math.random() * 50000); // Randomize the spinning duration
            spinStart.current = Date.now();
            let newSpeed = Math.PI / (16 + Math.random());
            setMaxSpeed(newSpeed); // Randomly vary how fast the spin is
            timerHandle.current = setInterval(onTimerTick, timerDelay);
        }
    };

    const onTimerTick = () => {
        draw(); // draw this frame
        const duration = new Date().getTime() - spinStart.current; // Elapsed time since spin started
        let progress = 0; // progress %. 1 = 100%
        let finished = false;

        if (duration < upTime) {
            // if we're not done accelerating
            progress = duration / upTime; // progress made
            angleDelta.current = maxSpeed * Math.sin((progress * Math.PI) / 2); // calculate how much to rotate based on the progress
        } else {
            progress = duration / downTime.current; // progress on deceleration
            // Now we calculate the angle change depending on the current progress
            angleDelta.current = maxSpeed * 1.7 * (1 / duration) ** progress;
            if (angleDelta.current <= 0.0007) {
                finished = true;
                callback(winner.current);
                winSFX.volume = 0.25;
                winSFX.play();
                drawConfetti(winner.current);
            } // We are done
        }

        angleCurrent.current += angleDelta.current;
        while (angleCurrent.current >= Math.PI * 2) angleCurrent.current -= Math.PI * 2;

        if (finished) {
            clearInterval(timerHandle.current);
            timerHandle.current = 0;
            angleDelta.current = 0;
        }
    };

    const draw = () => {
        if (canvasRef.current) {
            // clear last frame
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, width, height);
            // draw wheel
            let lastAngle = angleCurrent.current; // Moved inside the draw function
            let len = segments.current.length;
            const PI2 = Math.PI * 2;

            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000000";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.font = "1.4em Arial";

            for (let i = 1; i <= len; i++) {
                let angle = segments.current[i - 1].angle + lastAngle;
                drawSegment(i - 1, lastAngle, angle);
                lastAngle = angle; // Update the last angle
            }

            // Draw a center circle
            ctx.beginPath();
            ctx.arc(centerX.current, centerY.current, 20, 0, PI2, false);
            ctx.closePath();

            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#000000";
            ctx.fill();
            ctx.stroke();

            // Draw outer circle
            ctx.beginPath();
            ctx.arc(centerX.current, centerY.current, size.current, 0, PI2, false);
            ctx.closePath();

            ctx.lineWidth = 10;
            ctx.strokeStyle = "#000000";
            ctx.stroke();

            // draw needle
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#000000";
            ctx.fileStyle = "#ffffff";

            ctx.beginPath();

            ctx.moveTo(centerX.current + size.current - 40, centerY.current);
            ctx.lineTo(centerX.current + size.current + 20, centerY.current - 10);
            ctx.lineTo(centerX.current + size.current + 20, centerY.current + 10);
            ctx.closePath();

            ctx.stroke();
            ctx.fill();

            // Which segment is being pointed to?
            let anglePercentage = 1 - (angleCurrent.current % (Math.PI * 2)) / (Math.PI * 2);
            let currentCount = anglePercentage * totalCount;
            let accumulatedCount = 0;
            let pointed = 0;

            for (let i = 0; i < len; i++) {
                accumulatedCount += segments.current[i].count;
                if (currentCount < accumulatedCount) {
                    pointed = i;
                    break;
                }
            }
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#000000";
            ctx.font = "2em Arial";
            ctx.fillText(segments.current[pointed].username, centerX.current + size.current + 25, centerY.current);
            winner.current = segments.current[pointed].username;
            if (lastPointed.current !== winner.current) {
                tickSFX.volume = 0.25;
                tickSFX.play();
                lastPointed.current = winner.current;
            }
        }
    };

    const drawSegment = (key, lastAngle, angle) => {
        const ctx = canvasRef.current.getContext("2d");
        const value = segments.current[key];

        ctx.save();
        ctx.beginPath();

        // Start in the centre
        ctx.moveTo(centerX.current, centerY.current);
        ctx.arc(centerX.current, centerY.current, size.current, lastAngle, angle, false); // Draw a arc around the edge
        ctx.lineTo(centerX.current, centerY.current); // Now draw a line back to the centre

        // Clip anything that follows to this area
        ctx.closePath();

        ctx.fillStyle = seg_colors.current[key];
        ctx.fill();
        ctx.stroke();

        // Now draw the text
        ctx.save(); // The save ensures this works on Android devices
        ctx.translate(centerX.current, centerY.current);
        ctx.rotate((lastAngle + angle) / 2);

        ctx.fillStyle = "#000000";
        // ctx.translate(size / 2 + 20, 0); // This line is updated
        // ctx.rotate(-((lastAngle + angle) / 2)); // This line is added
        const username = value.username.substr(0, 15) + (value.username.length > 15 ? "..." : "");
        ctx.fillText(username, size.current / 2 + 20, 0, size.current / 2 + 20); // This line is updated
        ctx.restore();

        ctx.restore();
    };

    const drawConfetti = (winnerName) => {
        const confettiCanvas = document.createElement("canvas");
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        confettiCanvas.style.position = "absolute";
        confettiCanvas.style.top = 0;
        confettiCanvas.style.left = 0;
        confettiCanvas.style.pointerEvents = "none"; // Make the canvas non-interactable

        document.body.appendChild(confettiCanvas);

        const confettiCtx = confettiCanvas.getContext("2d");

        const particles = [];

        // Set up particle parameters
        const size = 10;
        const count = 200;
        const colors = [
            "#f44336",
            "#e91e63",
            "#9c27b0",
            "#673ab7",
            "#3f51b5",
            "#2196f3",
            "#03a9f4",
            "#00bcd4",
            "#009688",
            "#4caf50",
            "#8bc34a",
            "#cddc39",
            "#ffeb3b",
            "#ffc107",
            "#ff9800",
            "#ff5722",
        ];
        const gravity = 0.5;

        // Create particles
        for (let i = 0; i < count; i++) {
            const x = confettiCanvas.width * Math.random();
            const y = confettiCanvas.height * Math.random() * 0.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push({
                x,
                y,
                size,
                color,
                angle: Math.random() * 360,
                speed: Math.random() * 5 + 1,
                gravity,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 + 1,
            });
        }

        // Draw particles
        const drawParticles = () => {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confettiCtx.save();
            // confettiCtx.globalCompositeOperation = 'destination-out';
            confettiCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
            confettiCtx.fillRect(0, 0, confettiCtx.canvas.width, confettiCtx.canvas.height);
            confettiCtx.restore();
            // display winner's name

            confettiCtx.save();
            confettiCtx.font = "bold 50px Arial";
            confettiCtx.textAlign = "center";
            confettiCtx.textBaseline = "middle";
            confettiCtx.fillStyle = "#fff";
            confettiCtx.lineWidth = 2.5;
            confettiCtx.fillText(`Winner: ${winnerName}`, confettiCanvas.width / 2, confettiCanvas.height / 2);
            confettiCtx.strokeStyle = "#000";

            confettiCtx.strokeText(`Winner: ${winnerName}`, confettiCanvas.width / 2, confettiCanvas.height / 2);

            confettiCtx.restore();
            particles.forEach((particle, index) => {
                confettiCtx.save();
                confettiCtx.translate(particle.x + particle.size / 2, particle.y + particle.size / 2);
                confettiCtx.rotate((particle.rotation * Math.PI) / 180);
                confettiCtx.fillStyle = particle.color;
                confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                confettiCtx.restore();

                // Update particle position and rotation
                particle.y += particle.speed;
                particle.x += Math.cos((particle.angle * Math.PI) / 180) * particle.speed;
                particle.rotation += particle.rotationSpeed;

                // Apply gravity
                particle.gravity += 0.1;
                particle.y += particle.gravity;

                // Remove particles that have fallen off the screen
                if (particle.y > confettiCanvas.height) {
                    particles.splice(index, 1);
                }
            });

            // Request next frame
            requestAnimationFrame(drawParticles);
        };

        drawParticles();

        // Remove the confetti canvas after a few seconds
        setTimeout(() => {
            document.body.removeChild(confettiCanvas);
        }, 5000);
    };

    return <canvas ref={canvasRef} width={width} height={height} />;
};

function hsv_to_rgb(h, s, v) {
    // convert hsv to rgb and return the hex value
    let h_i, f, p, q, t;
    let r, g, b;

    h_i = Number.parseInt(h * 6);
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
    return "#" + Number.parseInt(r * 256).toString(16) + Number.parseInt(g * 256).toString(16) + Number.parseInt(b * 256).toString(16);
}

function genColor(num) {
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
