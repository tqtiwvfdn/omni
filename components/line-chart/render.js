function render(data, properties) {
    const { title, xAxisData, seriesData, smooth, showSymbol, height } = properties;
    
    // 处理变量替换
    const finalTitle = replaceVariables(title, data);
    const finalXAxisData = parseDataVariable(xAxisData, data);
    const finalSeriesData = parseDataVariable(seriesData, data);
    
    const chartId = 'line-chart-' + Math.random().toString(36).substr(2, 9);
    
    // 构建ECharts配置
    const option = {
        title: {
            text: finalTitle,
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: finalXAxisData
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            type: 'line',
            data: finalSeriesData,
            smooth: smooth,
            showSymbol: showSymbol,
            itemStyle: {
                color: '#2970FF'
            },
            lineStyle: {
                color: '#2970FF'
            }
        }]
    };
    
    return `
        <div class="line-chart-component">
            <div id="${chartId}" style="width: 100%; height: ${height};"></div>
            <script>
                (function() {
                    if (typeof echarts !== 'undefined') {
                        const chart = echarts.init(document.getElementById('${chartId}'));
                        chart.setOption(${JSON.stringify(option)});
                        
                        // 响应式调整
                        window.addEventListener('resize', function() {
                            chart.resize();
                        });
                    }
                })();
            </script>
        </div>
    `;
}

function replaceVariables(text, data) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });
}

function parseDataVariable(text, data) {
    const replaced = replaceVariables(text, data);
    try {
        return JSON.parse(replaced);
    } catch (e) {
        // 如果解析失败，返回默认数据
        return text.includes('x_data') ? ['周一', '周二', '周三', '周四', '周五'] : [120, 132, 101, 134, 90];
    }
}

// 导出渲染函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { render };
} else if (typeof window !== 'undefined') {
    window.LineChartRenderer = { render };
}