function App() {
	return (
		<main className='app-shell'>
			<section className='status-card'>
				<span className='status-badge'>0.1.0 初始化阶段</span>
				<h1>应用已启动</h1>
				<p>StoneDraw 前端工程与桌面壳基础链路已接通。</p>
				<dl className='status-grid'>
					<div>
						<dt>前端</dt>
						<dd>React 19 + TypeScript 6 + Vite 8</dd>
					</div>
					<div>
						<dt>桌面壳</dt>
						<dd>Tauri 2</dd>
					</div>
					<div>
						<dt>包管理</dt>
						<dd>Bun</dd>
					</div>
					<div>
						<dt>当前范围</dt>
						<dd>仅验证启动与构建链路</dd>
					</div>
				</dl>
			</section>
		</main>
	)
}

export default App
