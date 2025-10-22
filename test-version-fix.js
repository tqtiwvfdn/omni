// 测试版本修复脚本
// 这个脚本可以帮助用户验证智能体版本历史问题是否已修复

async function testVersionCreation(agentId) {
    console.log(`开始测试智能体 ${agentId} 的版本创建功能...`);
    
    try {
        // 1. 检查当前智能体信息
        console.log('步骤1: 获取当前智能体信息...');
        const agentResponse = await fetch(`/omni-api/agents/${agentId}`);
        const agentData = await agentResponse.json();
        console.log('智能体信息:', agentData);
        
        // 2. 检查当前版本历史
        console.log('\n步骤2: 获取当前版本历史...');
        const versionsResponse = await fetch(`/omni-api/agents/${agentId}/versions`);
        const versionsData = await versionsResponse.json();
        console.log('当前版本历史:', versionsData);
        
        // 3. 提示用户如何测试修复
        console.log('\n测试指南:');
        console.log('1. 打开 prompt-template-editor.html 编辑您的智能体');
        console.log('2. 点击 "保存并发布新版本" 按钮');
        console.log('3. 发布成功后，在 agent-management.html 页面查看历史版本');
        console.log('4. 如果版本历史不再为空，则修复成功');
        
        console.log('\n修复说明:');
        console.log('我们修复了版本创建逻辑中的问题 - 之前发布新版本时只更新了智能体信息，但没有创建版本记录。');
        console.log('现在发布新版本时，系统会同时创建版本记录，这样在历史版本页面就能正确显示了。');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        console.log('请确保服务器正在运行，并且智能体ID正确。');
    }
}

// 使用方法提示
console.log('版本修复测试脚本');
console.log('==================');
console.log('用法: 在浏览器控制台中执行 testVersionCreation("agent-1761035895808-135") 来测试特定智能体');
console.log('或者执行 testVersionCreation() 来获取更多使用帮助');
console.log('==================');