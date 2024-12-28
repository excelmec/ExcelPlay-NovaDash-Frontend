import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesComponent = () => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options = useMemo(
        () => ({
            background: {
                color: {
                    value: "transparent", // Changed to transparent
                },
            },
            fpsLimit: 60,
            particles: {
                number: {
                    value: 220,
                    density: {
                        enable: true,
                        value_area: 2500,
                    },
                },
                color: {
                    value: "#ffffff",
                },
                shape: {
                    type: "circle",
                },
                opacity: {
                    value: 0.4,
                },
                size: {
                    value: 1.6,
                    random: true,
                },
                move: {
                    enable: true,
                    speed: 10,
                    direction: "bottom",
                    random: true,
                    straight: true,
                    out_mode: "out",
                },
                links: {
                    enable: false,
                },
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onHover: {
                        enable: false,
                    },
                    onClick: {
                        enable: false,
                    },
                    resize: true,
                },
            },
            retina_detect: true,
            fullScreen: {
                enable: false, // Disable fullscreen
                zIndex: 0
            },
        }),
        []
    );

    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full max-w-md mx-auto">
                <Particles id="tsparticles" options={options} className="h-full" style={{ height: '100%' }} />
            </div>
        </div>
    );
};

export default ParticlesComponent;

