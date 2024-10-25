import React, { useState } from "react";
import './fileExtractor.css'

export const FileExtractor = () => {
    const [jsonData, setJsonData] = useState(null);
    const [labelKey, setLabelKey] = useState('');
    const [valueKey, setValueKey] = useState('');
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [orientation, setOrientation] = useState('horizontal');
    const [chartType, setChartType] = useState('bar');
    const [errorMessage, setErrorMessage] = useState('');
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!Array.isArray(data.data)) {
                        throw new Error("El formato del JSON no es válido. Se esperaba un array en 'data'.");
                    }
                    setJsonData(data);
                    setLabelKey('');
                    setValueKey('');
                    setErrorMessage('');
                    setIsFileUploaded(true);

                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    setErrorMessage('Error al analizar el archivo JSON: ' + error.message);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Por favor, carga un archivo JSON válido.');
        }
    };

    const handleLabelChange = (event) => {
        setLabelKey(event.target.value);
    };

    const handleValueChange = (event) => {
        setValueKey(event.target.value);
    };

    const handleOrientationChange = (event) => {
        setOrientation(event.target.value);
    };

    const handleChartTypeChange = (event) => {
        setChartType(event.target.value);
    };

    const renderBarGraph = () => {
        if (!jsonData || !labelKey || !valueKey) return;

        const dataPoints = jsonData.data.map((item) => ({
            label: item[labelKey],
            value: item[valueKey],
        }));

        const canvas = document.getElementById('barCanvas');
        const ctx = canvas.getContext('2d');

        const maxValue = Math.max(...dataPoints.map(dp => dp.value));
        const scalingFactor = 10;
        const canvasHeight = Math.min(maxValue * scalingFactor, 600);
        canvas.width = canvas.clientWidth;

        const margin = 40;
        canvas.height = canvasHeight + margin * 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);


        const totalBars = dataPoints.length;
        const totalAvailableWidth = canvas.width - margin * 2;
        const gap = 30;
        const barWidth = (totalAvailableWidth - gap * (totalBars - 1)) / totalBars;


        const usedColors = new Set();

        const getRandomColor = () => {
            let color;
            do {
                const letters = '0123456789ABCDEF';
                color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
            } while (usedColors.has(color));

            usedColors.add(color);
            return color;
        };

        if (orientation === 'horizontal') {
            const scaleX = (canvas.width - margin * 2) / maxValue;
            const marginY = 20;
            const totalHeight = (dataPoints.length * (barWidth + gap)) + marginY * 2 + 40;

            canvas.height = totalHeight;

            dataPoints.forEach((dp, index) => {
                ctx.fillStyle = getRandomColor();
                const barLength = dp.value * scaleX;
                const barY = index * (barWidth + gap) + margin + marginY;
                ctx.fillRect(margin, barY, barLength, barWidth + 20);

                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                ctx.fillText(dp.label, barLength + margin + 15, barY + barWidth / 2);
                ctx.fillText(dp.value, barLength + margin + 15, barY + barWidth / 2 + 15);
            });

        } else if (orientation === 'vertical') {
            const scaleY = (canvas.height - margin * 2) / maxValue;
            const totalWidth = (barWidth + gap) * totalBars - gap;
            const startX = (canvas.width - totalWidth) / 2;

            dataPoints.forEach((dp, index) => {
                ctx.fillStyle = getRandomColor();
                const barHeight = dp.value * scaleY;
                const barX = startX + index * (barWidth + gap);
                ctx.fillRect(barX, canvas.height - barHeight - margin, barWidth + 20, barHeight);

                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                ctx.fillText(dp.value, barX + 30, canvas.height - barHeight - margin - 15);
                ctx.fillText(dp.label, barX + 20, canvas.height - margin + 15);
            });
        }
    };



    const renderPieChart = () => {
        if (!jsonData || !labelKey || !valueKey) return;

        const dataPoints = jsonData.data.map((item) => ({
            label: item[labelKey],
            value: item[valueKey],
        }));

        const canvas = document.getElementById('pieCanvas');
        const ctx = canvas.getContext('2d');
        const totalValue = dataPoints.reduce((sum, dp) => sum + dp.value, 0);
        let currentAngle = 0;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const usedColors = new Set();
        const colors = [];

        const getRandomColor = () => {
            let color;
            do {
                const letters = '0123456789ABCDEF';
                color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
            } while (usedColors.has(color));

            usedColors.add(color);
            return color;
        };

        dataPoints.forEach(() => {
            const color = getRandomColor();
            colors.push(color);
        });

        dataPoints.forEach((dp, index) => {
            const sliceAngle = (dp.value / totalValue) * 2 * Math.PI;
            const percentage = ((dp.value / totalValue) * 100).toFixed(2);

            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(
                canvas.width / 2,
                canvas.height / 2,
                canvas.height / 2 - 20,
                currentAngle,
                currentAngle + sliceAngle
            );
            ctx.closePath();
            ctx.fillStyle = colors[index];
            ctx.fill();

            const textAngle = currentAngle + sliceAngle / 2;
            const textX = canvas.width / 2 + Math.cos(textAngle) * (canvas.height / 2 - 60);
            const textY = canvas.height / 2 + Math.sin(textAngle) * (canvas.height / 2 - 60);

            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${percentage}%`, textX, textY);

            currentAngle += sliceAngle;
        });



        
        renderLegendCanvas(dataPoints, colors);
    };

    const renderLegendCanvas = (dataPoints, colors) => {
        const legendCanvas = document.getElementById('legendCanvas');
        const ctx = legendCanvas.getContext('2d');
        
        legendCanvas.width = legendCanvas.clientWidth;
        legendCanvas.height = legendCanvas.clientHeight;
    
        ctx.clearRect(0, 0, legendCanvas.width, legendCanvas.height);
    
        let legendY = 20; 
        dataPoints.forEach((dp, index) => {
            ctx.fillStyle = colors[index]; 
            ctx.fillRect(10, legendY, 15, 15); 
            ctx.fillStyle = 'white'; 
            ctx.font = '12px Arial';
            ctx.fillText(dp.label + ': ' + dp.value, 35, legendY + 12);
            legendY += 25; 
        });
    };

    const renderRadarChart = () => {

        const usedColors = new Set();

        const getRandomColor = () => {
            let color;
            do {
                const letters = '0123456789ABCDEF';
                color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
            } while (usedColors.has(color));

            usedColors.add(color);
            return color;
        };

        if (!jsonData || !labelKey || !valueKey) return;

        const dataPoints = jsonData.data.map((item) => ({
            label: item[labelKey],
            value: item[valueKey],
        }));

        const canvas = document.getElementById('radarCanvas');
        const ctx = canvas.getContext('2d');

        const labels = dataPoints.map(dp => dp.label);
        const values = dataPoints.map(dp => dp.value);
        const numPoints = values.length;
        const maxValue = Math.max(...values);

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();

        const angleSlice = (2 * Math.PI) / numPoints;

        ctx.beginPath();
        values.forEach((value, index) => {
            const angle = angleSlice * index;
            const x = centerX + (value / maxValue) * radius * Math.cos(angle);
            const y = centerY + (value / maxValue) * radius * Math.sin(angle);
            ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = getRandomColor();
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.lineWidth = 1;
        for (let i = 0; i < numPoints; i++) {
            const angle = angleSlice * i;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            const textOffsetX = Math.cos(angle) > 0 ? 10 : -60;
            const textOffsetY = Math.sin(angle) > 0 ? 10 : -10;
            ctx.font = '16px Arial';
            ctx.fillText(labels[i], x + textOffsetX, y + textOffsetY);
        }

        values.forEach((value, index) => {
            const angle = angleSlice * index;
            const x = centerX + (value / maxValue) * radius * Math.cos(angle);
            const y = centerY + (value / maxValue) * radius * Math.sin(angle);
            const valueOffsetX = Math.cos(angle) > 0 ? 5 : -20;
            const valueOffsetY = Math.sin(angle) > 0 ? 5 : -10;
            ctx.fillText(value, x + valueOffsetX, y + valueOffsetY);
        });
    };

    const handleFinish = () => {
        setJsonData(null);
        setLabelKey('');
        setValueKey('');
        setOrientation('horizontal');
        setErrorMessage('');
        setFileInputKey(Date.now());
        setIsFileUploaded(false);
        setChartType('bar');
    };

    return (
        <div>
            {!isFileUploaded && (
                <div className="center-file">
                    <input
                        id="file-upload"
                        key={fileInputKey}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="custom-file-input"
                    />
                </div>
            )}

            <div>
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                {jsonData && (
                    <div className="container">
                        <div className="left-section">
                            <h2>Selecciona el valor para las etiquetas:</h2>
                            <select value={labelKey} onChange={handleLabelChange}>
                                <option value="">--Seleccione una clave--</option>
                                {Object.keys(jsonData.data[0]).map((key) => (
                                    <option key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                            </select>

                            <h2>Selecciona el valor para las claves:</h2>
                            <select value={valueKey} onChange={handleValueChange}>
                                <option value="">--Seleccione una clave--</option>
                                {Object.keys(jsonData.data[0]).map((key) => (
                                    <option key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="center-section">
                            <h2>Tipo de Gráfica:</h2>
                            <label>
                                <input
                                    type="radio"
                                    value="bar"
                                    checked={chartType === 'bar'}
                                    onChange={handleChartTypeChange}
                                />
                                Barras
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="pie"
                                    checked={chartType === 'pie'}
                                    onChange={handleChartTypeChange}
                                />
                                Pastel
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="radar"
                                    checked={chartType === 'radar'}
                                    onChange={handleChartTypeChange}
                                />
                                Radar
                            </label>
                            <br />
                            <h2>Orientación:</h2>
                            <label>
                                <input
                                    type="radio"
                                    value="horizontal"
                                    checked={orientation === 'horizontal'}
                                    onChange={handleOrientationChange}
                                />
                                Horizontal
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="vertical"
                                    checked={orientation === 'vertical'}
                                    onChange={handleOrientationChange}
                                />
                                Vertical
                            </label>
                            <br />
                            <button className="button-style" onClick={() => {
                                if (chartType === 'bar') renderBarGraph();
                                else if (chartType === 'pie') renderPieChart() && renderLegendCanvas();
                                else if (chartType === 'radar') renderRadarChart();
                            }}>
                                Mostrar Gráfica
                            </button>
                        </div>
                        <div className="right-section">
                            <canvas id="barCanvas" style={{ display: chartType === 'bar' ? 'block' : 'none' }}></canvas>
                            <canvas id="pieCanvas" style={{ display: chartType === 'pie' ? 'block' : 'none' }}></canvas>
                            <div className="legend-container">
                            <canvas className= "legend-canvas"id="legendCanvas" style={{ display: chartType === 'pie' ? 'block' : 'none', marginTop: '10px'}}></canvas>
                            </div>
                            <canvas id="radarCanvas" style={{ display: chartType === 'radar' ? 'block' : 'none' }}></canvas>

                            {jsonData && (
                                <button className="button-style" onClick={handleFinish}>
                                    Finalizar
                                </button>
                            )}

                        </div>

                    </div>
                )}
            </div>


        </div>
    );
};


