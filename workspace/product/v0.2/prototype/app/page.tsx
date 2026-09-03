"use client";

import { useMemo, useState } from "react";

type TicketStatus = "waiting" | "verify" | "serving" | "skipped" | "deferred" | "done" | "cancelled";
type Ticket = { id: number; no: string; phone: string; status: TicketStatus; owner?: boolean; barberId?: number };

const barbers = [
  { id: 1, name: "陈师傅", type: "社区理发摊", price: "剪发 ¥25", open: true, queue: 5, wait: 75, color: "amber", address: "梧桐路社区广场东侧", hours: "08:30–19:30", recent: true },
  { id: 2, name: "阿成理发", type: "沿街小店", price: "剪发 ¥35", open: true, queue: 2, wait: 36, color: "blue", address: "新安街 42 号", hours: "09:00–21:00", recent: false },
];

const loggedInNickname = "小林";

const initialTickets: Ticket[] = [
  { id: 18, no: "A018", phone: "1298", status: "serving" },
  { id: 19, no: "A019", phone: "7631", status: "verify" },
  { id: 20, no: "A020", phone: "4420", status: "waiting" },
  { id: 21, no: "A021", phone: "4420", status: "waiting", owner: true },
  { id: 22, no: "A022", phone: "4420", status: "waiting", owner: true },
  { id: 23, no: "A023", phone: "9066", status: "waiting" },
  { id: 2003, no: "B003", phone: "4420", status: "waiting", owner: true, barberId: 2 },
  { id: 14, no: "A014", phone: "4420", status: "skipped", owner: true, barberId: 1 },
  { id: 2002, no: "B002", phone: "4420", status: "done", owner: true, barberId: 2 },
];

const statusLabel: Record<TicketStatus, string> = {
  waiting: "等待中", verify: "下一位", serving: "服务中", skipped: "已过号",
  deferred: "已顺延", done: "已完成", cancelled: "已取消",
};

export default function Home() {
  const [role, setRole] = useState<"user" | "barber" | "admin">("user");
  const [userTab, setUserTab] = useState("首页");
  const [barberTab, setBarberTab] = useState("工作台");
  const [adminTab, setAdminTab] = useState("概览");
  const [detail, setDetail] = useState<number | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [isOpen, setIsOpen] = useState(true);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<"join" | "close" | "address" | null>(null);
  const [people, setPeople] = useState(1);
  const [joinBarberId, setJoinBarberId] = useState(1);

  const primaryBarberTickets = tickets.filter(t => (t.barberId ?? 1) === 1);
  const live = primaryBarberTickets.filter(t => !["done", "cancelled", "skipped"].includes(t.status));
  const waitingCount = live.filter(t => t.status !== "serving").length;
  const current = primaryBarberTickets.find(t => t.status === "serving");
  const candidate = primaryBarberTickets.find(t => t.status === "deferred") || primaryBarberTickets.find(t => t.status === "verify") || primaryBarberTickets.find(t => t.status === "waiting");
  const skipped = primaryBarberTickets.filter(t => t.status === "skipped");
  const joinTarget = barbers.find(b => b.id === joinBarberId) ?? barbers[0];
  const joinNext = useMemo(() => {
    const targetNumbers = tickets
      .filter(t => (t.barberId ?? 1) === joinBarberId)
      .map(t => Number(t.no.slice(1)))
      .filter(Number.isFinite);
    return Math.max(joinTarget.queue, ...targetNumbers) + 1;
  }, [tickets, joinBarberId, joinTarget.queue]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const openJoin = (barberId = 1) => {
    const barber = barbers.find(b => b.id === barberId);
    const available = barberId === 1 ? isOpen : Boolean(barber?.open);
    if (!available) {
      notify("该理发师已打烊，暂不可取号");
      return;
    }
    setJoinBarberId(barberId);
    setPeople(1);
    setModal("join");
  };

  const joinQueue = () => {
    const target = joinTarget;
    const next = joinNext;
    const prefix = joinBarberId === 1 ? "A" : "B";
    const created = Array.from({ length: people }, (_, i): Ticket => ({
      id: joinBarberId * 1000 + next + i, no: `${prefix}${String(next + i).padStart(3, "0")}`, phone: "4420", status: "waiting", owner: true, barberId: joinBarberId,
    }));
    setTickets(prev => [...prev, ...created]);
    setModal(null);
    notify(`已在${target.name}取得 ${people} 个连续号码`);
    setDetail(null);
    setUserTab("排队");
  };

  const finish = () => {
    if (!current) return;
    setTickets(prev => prev.map(t => t.id === current.id ? { ...t, status: "done" } : t));
    notify(`${current.no} 服务已完成`);
  };

  const begin = () => {
    if (!candidate) return;
    setTickets(prev => prev.map(t => t.id === candidate.id ? { ...t, status: "serving" } : t));
    notify(`${candidate.no} 已开始服务`);
  };

  const skip = () => {
    if (!candidate) return;
    setTickets(prev => prev.map(t => t.id === candidate.id ? { ...t, status: "skipped" } : t));
    notify(`${candidate.no} 已过号，用户将收到提醒`);
  };

  const defer = (id: number) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "deferred" } : t));
    notify("已加入顺延队列，将优先叫号");
  };

  const cancelTicket = (id: number) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
    notify("号码已取消，队列已重新计算");
  };

  const forceClose = () => {
    setTickets(prev => prev.map(t => ["waiting", "verify", "deferred"].includes(t.status) ? { ...t, status: "skipped" } : t));
    setIsOpen(false);
    setModal(null);
    notify("已强制关店，剩余号码均已过号");
  };

  return (
    <main className="site-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">理</span>
          <div><strong>邻剪</strong><small>社区理发排队平台 · v0.2 试运行原型</small></div>
        </div>
        <div className="role-switch" aria-label="切换演示端">
          <button className={role === "user" ? "active" : ""} onClick={() => setRole("user")}>用户端</button>
          <button className={role === "barber" ? "active" : ""} onClick={() => setRole("barber")}>理发师端</button>
          <button className={role === "admin" ? "active" : ""} onClick={() => setRole("admin")}>管理端</button>
        </div>
        <div className="demo-hint"><span className="pulse" />实时联动演示</div>
      </header>

      <section className={`workspace ${role}`}>
        <aside className="context-panel">
          <p className="eyebrow">PROTOTYPE v0.2</p>
          <h1>{role === "user" ? "看看队伍，排到再出发。" : role === "barber" ? "少喊几遍号，专心剪好头。" : "把社区里的好手艺连接起来。"}</h1>
          <p>{role === "user" ? "查看熟悉理发师的营业和实时队伍，临近时再到现场，告别漫长等候。" : role === "barber" ? "简单三步推进队伍：完成、核验、开始。熟悉的线下节奏，不增加负担。" : "轻量管理入驻、账号和服务数据，不干预理发师现场经营。"}</p>
          <div className="live-card">
            <span>当前演示数据</span>
            <strong>{isOpen ? "陈师傅 · 营业中" : "陈师傅 · 已关店"}</strong>
            <div><b>{waitingCount}</b> 人等待 <i /> 约 <b>{waitingCount * 15}</b> 分钟</div>
          </div>
          <div className="scenario-list">
            <span>可体验场景</span>
            <p>01 用户连续取号与取消</p>
            <p>02 理发师完成、跳号与顺延</p>
            <p>03 强制关店与数据联动</p>
          </div>
        </aside>

        <div className="phone-wrap">
          <div className="phone">
            <div className="phone-top"><span>9:41</span><span className="island" /><span>● ◒</span></div>
            {role === "user" && (
              <UserApp tab={userTab} setTab={setUserTab} detail={detail} setDetail={setDetail}
                tickets={tickets} isOpen={isOpen} onJoin={openJoin} onCancel={cancelTicket} />
            )}
            {role === "barber" && (
              <BarberApp tab={barberTab} setTab={setBarberTab} isOpen={isOpen} tickets={tickets}
                current={current} candidate={candidate} skipped={skipped} waitingCount={waitingCount}
                onFinish={finish} onBegin={begin} onSkip={skip} onDefer={defer}
                onOpen={() => setModal("address")} onClose={() => live.length ? setModal("close") : setIsOpen(false)} />
            )}
            {role === "admin" && <AdminApp tab={adminTab} setTab={setAdminTab} tickets={tickets} isOpen={isOpen} notify={notify} />}
          </div>
          <div className="phone-shadow" />
        </div>
      </section>

      {modal === "join" && <JoinModal barber={joinTarget} next={joinNext} people={people} setPeople={setPeople} onClose={() => setModal(null)} onJoin={joinQueue} />}
      {modal === "close" && <ConfirmClose count={waitingCount} serving={!!current} onClose={() => setModal(null)} onConfirm={forceClose} />}
      {modal === "address" && <AddressModal onClose={() => setModal(null)} onOpen={(address: string) => { setIsOpen(true); setModal(null); notify(`已在${address}开店`); }} />}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}

function UserApp({ tab, setTab, detail, setDetail, tickets, isOpen, onJoin, onCancel }: any) {
  const myTickets = tickets.filter((t: Ticket) => t.owner && t.status !== "cancelled");
  const activeMyTickets = myTickets.filter((t: Ticket) => !["done", "skipped"].includes(t.status));
  const labels = ["首页", "排队"];
  return (
    <div className="app user-app">
      <div className="app-content">
        {detail ? <BarberDetail onBack={() => setDetail(null)} onJoin={() => onJoin(detail)} isOpen={detail === 1 ? isOpen : Boolean(barbers.find(b => b.id === detail)?.open)} />
          : tab === "首页" ? <UserHome onDetail={(id: number) => setDetail(id)} onJoin={onJoin} isOpen={isOpen} />
          : <MyQueue tickets={myTickets} onCancel={onCancel} />}
      </div>
      {!detail && <BottomNav labels={labels} active={tab} onChange={setTab} icons={["⌂", "≋"]} badge={activeMyTickets.length || undefined} />}
    </div>
  );
}

function UserHome({ onDetail, onJoin, isOpen }: any) {
  return (
    <>
      <div className="mini-header"><h2>{loggedInNickname}</h2></div>
      <div className="search-row">
        <div className="search">⌕ <span>搜索理发师</span></div>
      </div>
      <div className="quick-strip">
        <div><small>正在营业</small><strong>{isOpen ? 2 : 1}<em> 位</em></strong></div>
        <span />
        <div><small>最快轮到</small><strong>18<em> 分钟</em></strong></div>
      </div>
      <div className="section-title"><h3>附近的理发师</h3></div>
      <div className="barber-list">
        {barbers.map((b, i) => {
          const displayBarber = b.id === 1 ? { ...b, open: isOpen } : b;
          return <BarberCard key={b.id} barber={displayBarber} index={i} onClick={() => onDetail(b.id)} onJoin={displayBarber.open ? () => onJoin(b.id) : undefined} />;
        })}
      </div>
    </>
  );
}

function BarberCard({ barber: b, index, onClick, onJoin }: any) {
  return (
    <article className={`barber-card ${!b.open ? "is-closed" : ""}`} onClick={onClick} onKeyDown={e => { if (e.key === "Enter") onClick(); }} role="button" tabIndex={0} aria-label={`查看${b.name}详情`}>
      <div className={`barber-photo ${b.color}`}><span>{b.name.slice(0, 1)}</span>{index === 0 && <i>最近服务</i>}</div>
      <div className="barber-info">
        <div className="name-row"><h4>{b.name}</h4><span className={b.open ? "open" : "closed"}>{b.open ? "营业中" : "已打烊"}</span></div>
        <p>{b.type} · {b.address}</p><p className="price">{b.price}</p>
        <div className="queue-line">{b.open ? <><b>{b.queue}人</b>排队 <span>预计 {b.wait} 分钟</span></> : <span>明日 {b.hours.split("–")[0]} 营业</span>}</div>
      </div>
      {b.open && onJoin ? <button className="quick-join" onClick={e => { e.stopPropagation(); onJoin(); }} aria-label={`立即在${b.name}取号`}>立即取号</button> : <span className="chevron">›</span>}
    </article>
  );
}

function BarberDetail({ onBack, onJoin, isOpen }: any) {
  return (
    <div className="detail-page">
      <div className="hero-img">
        <button className="back" onClick={onBack}>‹</button>
        <div className="awning"><span /><span /><span /><span /><span /></div><div className="shop">邻里理发<div>✂</div></div>
      </div>
      <div className="detail-body">
        <div className="name-row"><div><h2>陈师傅</h2><p>社区理发摊 · 梧桐路社区广场东侧</p></div><span className={isOpen ? "open" : "closed"}>{isOpen ? "营业中" : "已打烊"}</span></div>
        <div className="metric-card">
          <div><small>当前排队</small><strong>{isOpen ? 5 : 0}<em> 人</em></strong></div>
          <div><small>预计等待</small><strong>{isOpen ? 75 : "--"}<em> 分钟</em></strong></div>
          <div><small>平均服务</small><strong>15<em> 分钟</em></strong></div>
        </div>
        <div className="info-list">
          <div><span>⌖</span><p><b>梧桐路社区广场东侧</b><small>本次营业地址</small></p></div>
          <div><span>◷</span><p><b>08:30–19:30</b><small>实际接号以营业状态为准</small></p></div>
          <div><span>¥</span><p><b>剪发参考价 ¥25</b><small>现场支付，价格以理发师说明为准</small></p></div>
        </div>
        <div className="notice"><b>排队提示</b><p>预计时间会随取消、过号和实际服务进度动态变化，请留意临近提醒。</p></div>
      </div>
      <div className="sticky-action"><div><small>当前预计等待</small><strong>{isOpen ? "约 75 分钟" : "暂不可取号"}</strong></div><button disabled={!isOpen} onClick={onJoin}>{isOpen ? "立即取号" : "已打烊"}</button></div>
    </div>
  );
}

function MyQueue({ tickets, onCancel }: any) {
  const [queueTab, setQueueTab] = useState<"进行中" | "已过号" | "已完成">("进行中");
  const visibleTickets = tickets.filter((ticket: Ticket) => queueTab === "进行中"
    ? !["done", "skipped", "cancelled"].includes(ticket.status)
    : queueTab === "已过号" ? ticket.status === "skipped" : ticket.status === "done");
  const groups = barbers.map(barber => ({
    barber,
    tickets: visibleTickets.filter((ticket: Ticket) => (ticket.barberId ?? 1) === barber.id),
  })).filter(group => group.tickets.length > 0);
  return (
    <>
      <div className="simple-header"><h2>我的排队</h2><button>⋯</button></div>
      <div className="segmented">{(["进行中", "已过号", "已完成"] as const).map(label => <button key={label} className={queueTab === label ? "active" : ""} onClick={() => setQueueTab(label)}>{label}</button>)}</div>
      {groups.length ? groups.map(({ barber, tickets: barberTickets }) => <div className="my-queue-card" key={barber.id}>
          <div className="queue-card-top"><div className={`mini-avatar ${barber.color}`}>{barber.name[0]}</div><div><h3>{barber.name}</h3><p>{barber.address}</p></div><span className={queueTab === "进行中" ? "open" : "closed"}>{queueTab === "进行中" ? "营业中" : queueTab}</span></div>
          <div className="ticket-stack">
            {barberTickets.map((t: Ticket, index: number) => <div className={`ticket-row ${t.status}`} key={t.id}>
              <div><small>{statusLabel[t.status]}</small><strong>{t.no}</strong></div>
              {queueTab === "进行中" ? <><div><small>前方还有</small><b>{Math.max(0, barber.queue + index)} 人</b></div><div><small>预计等待</small><b>{Math.max(0, barber.wait + index * 15)} 分钟</b></div>{["waiting", "verify"].includes(t.status) && <button onClick={() => onCancel(t.id)}>取消</button>}</>
                : queueTab === "已过号" ? <><div><small>过号时间</small><b>今天 14:06</b></div><div><small>下一步</small><b>现场沟通顺延</b></div></>
                : <><div><small>完成时间</small><b>7月28日 16:20</b></div><div><small>服务地点</small><b>{barber.address}</b></div></>}
            </div>)}
          </div>
          {queueTab === "进行中" && <><div className="queue-progress"><span style={{ width: barber.id === 1 ? "38%" : "56%" }} /></div><div className="reminder-line">◉ 前方剩 3 人时将通过微信提醒你</div><div className="card-actions"><button>联系信息</button></div></>}
          {queueTab === "已过号" && <div className="card-actions"><button>查看详情</button><button className="primary">联系理发师</button></div>}
          {queueTab === "已完成" && <div className="card-actions"><button>服务详情</button><button className="primary">再次取号</button></div>}
        </div>) : <div className="empty-state"><h3>{queueTab === "进行中" ? "无排队" : queueTab === "已过号" ? "没有已过号的号码" : "还没有完成记录"}</h3>{queueTab !== "进行中" && <p>相关记录会在这里统一展示。</p>}</div>}
    </>
  );
}

function BarberApp({ tab, setTab, isOpen, tickets, current, candidate, skipped, waitingCount, onFinish, onBegin, onSkip, onDefer, onOpen, onClose }: any) {
  const labels = ["工作台", "数据", "我的"];
  return <div className="app barber-app"><div className="app-content">
    {tab === "工作台" ? <BarberDashboard {...{ isOpen, tickets, current, candidate, skipped, waitingCount, onFinish, onBegin, onSkip, onDefer, onOpen, onClose }} />
      : tab === "数据" ? <Records tickets={tickets} />
      : <BarberProfile />}
  </div><BottomNav labels={labels} active={tab} onChange={setTab} icons={["▦", "◷", "○"]} /></div>;
}

function BarberDashboard({ isOpen, tickets, current, candidate, skipped, waitingCount, onFinish, onBegin, onSkip, onDefer, onOpen, onClose }: any) {
  return <>
    <div className="barber-head">
      <div><p>7月31日 · 星期五</p><h2>陈师傅，下午好</h2><small className="today-completed">今日完成 {tickets.filter((t: Ticket) => t.status === "done").length + 7} 人</small></div>
      <button className={`shop-switch ${isOpen ? "on" : ""}`} onClick={isOpen ? onClose : onOpen}><i />{isOpen ? "营业中" : "开始营业"}</button>
    </div>
    {!isOpen ? <div className="closed-dashboard"><div>休</div><h3>今天尚未营业</h3><p>选择本次服务地址，开启今天的排队。</p><button onClick={onOpen}>选择地址并开店</button></div> : <>
      {current ? <div className="service-card current">
        <div className="card-tag"><span className="pulse" />正在服务</div>
        <div className="big-ticket"><div><small>当前号码</small><strong>{current.no}</strong></div><span /><div><small>手机尾号</small><strong>{current.phone}</strong></div></div>
        <div className="timer">等待 <b>{waitingCount}</b> 人 <span>· 预计全部完成 {waitingCount * 15} 分钟</span></div>
        <button className="complete-btn" onClick={onFinish}>完成服务</button>
      </div> : <div className="service-card idle"><span>✂</span><h3>当前没有正在服务的用户</h3><p>核验下一位用户后开始服务</p></div>}
      {candidate && !current && <div className="service-card next">
        <div className="card-tag">下一位 · 请核验现场</div>
        <div className="big-ticket"><div><small>号码</small><strong>{candidate.no}</strong></div><span /><div><small>手机尾号</small><strong>{candidate.phone}</strong></div></div>
        <div className="dual-actions"><button onClick={onSkip}>未到场 / 跳号</button><button onClick={onBegin}>开始服务</button></div>
      </div>}
      <div className="queue-overview">
        <div className="section-title"><h3>排队总览</h3><span>全部 {tickets.filter((t: Ticket) => !["done", "cancelled"].includes(t.status)).length} 人 ›</span></div>
        <div className="queue-chips">{tickets.filter((t: Ticket) => !["done", "cancelled"].includes(t.status)).slice(0, 7).map((t: Ticket) => <div className={t.status} key={t.id}><b>{t.no}</b><small>{statusLabel[t.status]}</small></div>)}</div>
      </div>
      {skipped.length > 0 && <div className="skipped-box"><div className="section-title"><h3>已过号</h3><span>{skipped.length} 人</span></div>{skipped.map((t: Ticket) => <div className="skipped-row" key={t.id}><div><b>{t.no}</b><span>尾号 {t.phone}</span></div><button onClick={() => onDefer(t.id)}>确认顺延</button></div>)}</div>}
    </>}
  </>;
}

function Records({ tickets }: any) {
  const completed = tickets.filter((t: Ticket) => t.status === "done").length + 7;
  const skippedCount = tickets.filter((t: Ticket) => t.status === "skipped").length;
  const cancelled = tickets.filter((t: Ticket) => t.status === "cancelled").length + 2;
  return <><div className="simple-header"><h2>数据看板</h2><button>日历⌄</button></div><div className="date-strip"><button>‹</button><div><b>今天</b><span>7月31日</span></div><button>›</button></div><div className="revenue-card"><small>今日营业额</small><strong>¥ {completed * 25}</strong><p>共完成 {completed} 位客户</p></div><div className="data-metrics"><div><span className="metric-icon done">✓</span><b>{completed}</b><small>完成服务</small></div><div><span className="metric-icon skipped">!</span><b>{skippedCount}</b><small>过号</small></div><div><span className="metric-icon cancelled">×</span><b>{cancelled}</b><small>取消</small></div></div></>;
}

function BarberProfile() {
  return <><div className="barber-profile-head"><div className="barber-profile-avatar">陈</div><div><h2>陈师傅</h2><p>138****2831</p></div><button className="profile-edit">修改</button></div><div className="settings-list"><button><span>⌖</span>营业地址<i>3 个 ›</i></button><button><span>◷</span>常规营业时间<i>08:30–19:30 ›</i></button><button><span>≈</span>平均1人剪发时长<i>15 分钟 ›</i></button><button><span>◎</span>消息与帮助<i>›</i></button></div><div className="version">邻剪理发师端 · 原型版本 v0.2</div></>;
}

function AdminApp({ tab, setTab, tickets, isOpen, notify }: any) {
  const labels = ["概览", "理发师", "用户", "我的"];
  return <div className="app admin-app"><div className="app-content">
    {tab === "概览" ? <AdminOverview tickets={tickets} isOpen={isOpen} setTab={setTab} />
      : tab === "理发师" ? <BarberManagement isOpen={isOpen} notify={notify} />
      : tab === "用户" ? <UserManagement />
      : <AdminProfile />}
  </div><BottomNav labels={labels} active={tab} onChange={setTab} icons={["▦", "✂", "◎", "○"]} /></div>;
}

function AdminOverview({ tickets, isOpen, setTab }: any) {
  const skipped = tickets.filter((t: Ticket) => t.status === "skipped").length;
  return <>
    <div className="admin-head"><div><p>平台运营中心</p><h2>下午好，运营小周</h2></div><button>🔔<i>3</i></button></div>
    <div className="admin-hero"><small>今日服务概况</small><strong>{tickets.filter((t: Ticket) => t.status === "done").length + 46}<span>次</span></strong><p>较昨日 <b>↑ 12.4%</b></p><div className="spark-bars"><i /><i /><i /><i /><i /><i /><i /></div></div>
    <div className="admin-grid"><div><span className="green-dot" /><small>营业理发师</small><b>{isOpen ? 18 : 17}</b></div><div><span>≋</span><small>当前排队</small><b>{tickets.filter((t: Ticket) => ["waiting", "verify", "deferred"].includes(t.status)).length + 21}</b></div><div><span>✓</span><small>今日完成</small><b>{tickets.filter((t: Ticket) => t.status === "done").length + 46}</b></div><div><span>!</span><small>今日过号</small><b>{skipped + 3}</b></div></div>
    <div className="section-title"><h3>快捷操作</h3></div><div className="quick-actions"><button onClick={() => setTab("理发师")}><span>＋</span><b>理发师入驻</b><small>录入资料并邀请绑定</small></button><button onClick={() => setTab("用户")}><span>⌕</span><b>查找用户</b><small>手机号与服务记录</small></button></div>
    <div className="section-title"><h3>实时动态</h3><span>查看全部 ›</span></div><div className="activity-list"><div><i className="green" /><p><b>陈师傅</b> 当前有 {tickets.filter((t: Ticket) => t.status === "waiting").length} 人排队</p><time>刚刚</time></div><div><i className="blue" /><p><b>阿成理发</b> 完成号码 B016</p><time>3分钟前</time></div></div>
  </>;
}

function BarberManagement({ isOpen, notify }: any) {
  const [search, setSearch] = useState("");
  const filtered = barbers.filter(b => b.name.includes(search));
  return <><div className="simple-header"><h2>理发师管理</h2><button className="add-btn" onClick={() => notify("已打开理发师入驻表单")}>＋ 入驻</button></div><div className="admin-search">⌕ <input value={search} onChange={e => setSearch(e.target.value)} placeholder="姓名或手机号" /></div><div className="filter-pills"><button className="active">全部 2</button><button>营业中 {isOpen ? 2 : 1}</button><button>待绑定 0</button></div><div className="manage-list">{filtered.map((b, i) => <button key={b.id}><div className={`mini-avatar ${b.color}`}>{b.name[0]}</div><div><b>{b.name}</b><span>{i === 0 ? "138****2831" : "186****1208"} · {b.type}</span><small>最近营业：今天</small></div><em className={(b.id === 1 ? isOpen : b.open) ? "online" : ""}>{(b.id === 1 ? isOpen : b.open) ? "营业中" : "已关店"}</em><i>›</i></button>)}</div></>;
}

function UserManagement() {
  return <><div className="simple-header"><h2>用户管理</h2><button>筛选⌄</button></div><div className="admin-search">⌕ <input placeholder="搜索手机号或昵称" /></div><div className="user-count"><b>1,286</b><span>平台累计用户</span><em>本周 +84</em></div><div className="manage-list users">{[["林先生","138****4420","12次服务 · 1次过号"],["王阿姨","159****7631","8次服务 · 当前排队"],["张女士","186****9066","3次服务 · 2次取消"],["李师傅","177****1298","16次服务 · 当前服务"]].map((u, i) => <button key={u[1]}><div className={`mini-avatar ${["blue","amber","green","purple"][i]}`}>{u[0][0]}</div><div><b>{u[0]}</b><span>{u[1]}</span><small>{u[2]}</small></div><i>›</i></button>)}</div></>;
}

function AdminProfile() {
  return <><div className="admin-profile-head"><div className="admin-profile-avatar">周</div><div><h2>运营小周</h2><p>超级管理员</p></div></div><div className="settings-list"><button><span>▤</span>服务记录查询<i>›</i></button><button><span>⚿</span>账号权限<i>›</i></button><button><span>◎</span>操作日志<i>›</i></button><button><span>?</span>帮助中心<i>›</i></button></div></>;
}

function BottomNav({ labels, active, onChange, icons, badge }: any) {
  return <nav className="bottom-nav">{labels.map((l: string, i: number) => <button key={l} className={active === l ? "active" : ""} onClick={() => onChange(l)}><span>{icons[i]}{i === 1 && badge ? <i>{badge}</i> : null}</span><small>{l === "排队" ? "我的排队" : l}</small></button>)}</nav>;
}

function JoinModal({ barber, next, people, setPeople, onClose, onJoin }: any) {
  const prefix = barber.id === 1 ? "A" : "B";
  const firstNo = `${prefix}${String(next).padStart(3, "0")}`;
  const lastNo = `${prefix}${String(next + people - 1).padStart(3, "0")}`;
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="sheet" onMouseDown={e => e.stopPropagation()}><div className="grab" /><div className="sheet-head"><div><small>{barber.name} · 营业中</small><h2>选择取号人数</h2></div><button onClick={onClose}>×</button></div><p className="sheet-copy">同一次取号会生成连续号码，每个号码可独立取消。</p><div className="people-select">{[1,2,3].map(n => <button className={people === n ? "active" : ""} key={n} onClick={() => setPeople(n)}><b>{n}</b><span>{n === 1 ? "自己" : `${n} 人同行`}</span></button>)}</div><div className="join-summary"><div><span>预计号码</span><b>{people === 1 ? firstNo : `${firstNo}–${lastNo}`}</b></div><div><span>前方人数</span><b>{barber.queue} 人</b></div><div><span>预计等待</span><b>约 {barber.wait} 分钟</b></div></div><label className="consent"><input type="checkbox" defaultChecked /><span>接收前方剩 3 人及过号提醒</span></label><p className="fineprint">预计时间为动态估算；拒绝消息授权仍可取号，但可能错过叫号。</p><button className="sheet-primary" onClick={onJoin}>确认取 {people} 个号</button></div></div>;
}

function ConfirmClose({ count, serving, onClose, onConfirm }: any) {
  return <div className="modal-backdrop"><div className="dialog"><div className="warning-icon">!</div><h2>确认强制关店？</h2>{serving ? <p>当前仍有用户正在服务，请先完成当前服务后再关店。</p> : <p>还有 <b>{count}</b> 个号码未完成。强制关店后，这些号码将全部过号并通知用户。</p>}<div><button onClick={onClose}>暂不关店</button><button className="danger" disabled={serving} onClick={onConfirm}>强制关店</button></div></div></div>;
}

function AddressModal({ onClose, onOpen }: any) {
  const [selected, setSelected] = useState("梧桐路社区广场东侧");
  const [adding, setAdding] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const address = adding ? newAddress.trim() : selected;
  return <div className="modal-backdrop"><div className="sheet address-sheet"><div className="grab" /><div className="sheet-head"><div><small>开始今天的营业</small><h2>选择文字服务地址</h2></div><button onClick={onClose}>×</button></div><p className="sheet-copy">老顾客已熟悉摊位位置，选择常用地址或直接填写本次营业地点。</p><label className={`address-option ${!adding && selected === "梧桐路社区广场东侧" ? "selected" : ""}`}><input type="radio" checked={!adding && selected === "梧桐路社区广场东侧"} name="address" onChange={() => { setAdding(false); setSelected("梧桐路社区广场东侧"); }} /><span>址</span><div><b>梧桐路社区广场东侧</b><small>上次使用</small></div><em>默认</em></label><label className={`address-option ${!adding && selected === "春和苑南门便民点" ? "selected" : ""}`}><input type="radio" checked={!adding && selected === "春和苑南门便民点"} name="address" onChange={() => { setAdding(false); setSelected("春和苑南门便民点"); }} /><span>址</span><div><b>春和苑南门便民点</b><small>常用地址</small></div></label>{adding ? <div className="new-address-form"><label htmlFor="new-service-address">本次营业地址</label><input id="new-service-address" autoFocus value={newAddress} onChange={event => setNewAddress(event.target.value)} placeholder="请输入摊位或门店地址" /></div> : <button className="new-address" onClick={() => setAdding(true)}>＋ 新增文字地址</button>}<button className="sheet-primary" disabled={!address} onClick={() => onOpen(address)}>确认地址并开店</button></div></div>;
}
