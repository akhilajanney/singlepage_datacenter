import React from "react";
import Lottie from 'react-lottie';
import animeLoading from './animations/loading2.json';

export const chartOption = async (chartcolor, format) => {
    let opt = {
        chart: {
            id: "area-datetime",
            type: "area",
            height: 380,
            curve: "smooth",
            zoom: {
                autoScaleYaxis: true,
            },
            animations: {
                enabled: true,
                easing: "easeinout",
                speed: 500,
                animateGradually: {
                    enabled: true,
                    delay: 500,
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 500,
                },
            },
        },
        stroke: {
            width: 2,
        },
        dataLabels: {
            enabled: false,
        },
        markers: {
            size: 0,
        },
        xaxis: {
            type: "datetime",
            tickAmount: 1,
            labels: {
                datetimeUTC: false,
            },
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return val.toFixed(0)
                }
            }
        },
        tooltip: {
            x: {
                format: format,
            },
        },
        colors: chartcolor,
    };
    return opt;
}

export const DataLoading = () => {
    return (
        <Lottie
            options={{
                loop: true,
                autoplay: true,
                animationData: animeLoading,
                rendererSettings: {
                    preserveAspectRatio: 'xMidYMid slice'
                }
            }}
            width={150}
            height={150}
        />
    )
}