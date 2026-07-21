import { useState } from 'react';

// Link fictício para navegação interna, substituirá os href="telaX.html"
// No futuro usaremos react-router-dom
const NavLink = ({ href, children, active }) => {
  const baseClasses = "flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-semibold";
  const activeClasses = active ? "bg-accent text-accent-foreground" : "text-foreground/80 hover:bg-accent hover:text-accent-foreground";
  
  return (
    <a href={href} className={`${baseClasses} ${activeClasses}`}>
      {children}
    </a>
  );
};

export default function Auth() {
  // Estados para substituir a lógica do <script>
  const [activeTab, setActiveTab] = useState('cadastro'); // 'login' ou 'cadastro'
  const [selectedRole, setSelectedRole] = useState('paciente'); // 'paciente' ou 'fonoaudiologo'

  // Componente interno para os inputs (para limpar o código principal)
  const InputField = ({ label, id, type = "text", ...props }) => (
    <div className="space-y-2">
      <label className="text-base font-semibold" htmlFor={id}>{label}</label>
      <input 
        className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-12 text-base" 
        id={id} 
        type={type} 
        {...props}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER - Repetido nas 3 telas no HTML original */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
          <a href="index.html" className="flex items-center gap-3 text-2xl font-extrabold text-primary">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"></path><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"></path></svg>
            </span>
            <span>EscutaBem</span>
          </a>
          
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="tela2.html">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
              <span>Dúvidas</span>
            </NavLink>
            <NavLink href="tela3.html">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path></svg>
              <span>Chat</span>
            </NavLink>
            <a href="tela1.html" className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 rounded-md px-8 text-base ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg>
              Entrar
            </a>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="container mx-auto max-w-md px-4 py-12">
          
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8"><path d="m10 17 5-5-5-5"></path><path d="M15 12H3"></path><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path></svg>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Acessar EscutaBem</h1>
            <p className="mt-2 text-base text-muted-foreground">Entre como paciente ou fonoaudiólogo(a).</p>
          </div>

          <div className="rounded-xl border border-border bg-card text-card-foreground shadow p-6">
            {/* TABS - SwitchTab refatorado para usar estado */}
            <div className="items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid w-full grid-cols-2 h-12 mb-4">
              <button 
                type="button" 
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-base ${activeTab === 'login' ? 'bg-background text-foreground shadow' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Entrar
              </button>
              <button 
                type="button" 
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-base ${activeTab === 'cadastro' ? 'bg-background text-foreground shadow' : ''}`}
                onClick={() => setActiveTab('cadastro')}
              >
                Criar conta
              </button>
            </div>

            {/* CONTENT LOGIN - Hidden substituído por renderização condicional do React */}
            {activeTab === 'login' && (
              <div id="content-login">
                <form className="space-y-4 pt-2" onSubmit={(e) => e.preventDefault()}>
                  <InputField label="Email" id="l-email" type="email" placeholder="seu@email.com" required />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-base font-semibold" htmlFor="l-senha">Senha</label>
                      <a href="#" className="text-sm font-medium text-primary hover:underline">Esqueceu a senha?</a>
                    </div>
                    <input className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-12 text-base" id="l-senha" required type="password" placeholder="••••••••" />
                  </div>
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md px-8 h-14 w-full text-lg font-bold mt-2" type="submit">
                    Entrar
                  </button>
                </form>
              </div>
            )}

            {/* CONTENT CADASTRO */}
            {activeTab === 'cadastro' && (
              <div id="content-cadastro">
                <form className="space-y-4 pt-2" onSubmit={(e) => e.preventDefault()}>
                  {/* ROLE SELECTION - SelectRole refatorado */}
                  <div className="space-y-2">
                    <label className="text-base font-semibold">Eu sou</label>
                    <div className="grid grid-cols-1 gap-2">
                      
                      {/* Paciente */}
                      <label 
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${selectedRole === 'paciente' ? 'border-primary bg-primary-soft/50' : 'border-border hover:border-primary/50'}`}
                        onClick={() => setSelectedRole('paciente')}
                      >
                        <div className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow flex items-center justify-center mt-1">
                          {selectedRole === 'paciente' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 fill-primary"><circle cx="12" cy="12" r="10"></circle></svg>
                          )}
                        </div>
                        <input type="radio" name="role" value="paciente" className="hidden" defaultChecked={selectedRole === 'paciente'} />
                        <div>
                          <div className="flex items-center gap-2 text-base font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> 
                            Paciente / usuário(a)
                          </div>
                          <p className="text-sm text-muted-foreground">Tire dúvidas e envie perguntas para fonoaudiólogos.</p>
                        </div>
                      </label>

                      {/* Fonoaudiólogo */}
                      <label 
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${selectedRole === 'fonoaudiologo' ? 'border-primary bg-primary-soft/50' : 'border-border hover:border-primary/50'}`}
                        onClick={() => setSelectedRole('fonoaudiologo')}
                      >
                        <div className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow flex items-center justify-center mt-1">
                          {selectedRole === 'fonoaudiologo' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 fill-primary"><circle cx="12" cy="12" r="10"></circle></svg>
                          )}
                        </div>
                        <input type="radio" name="role" value="fonoaudiologo" className="hidden" defaultChecked={selectedRole === 'fonoaudiologo'} />
                        <div>
                          <div className="flex items-center gap-2 text-base font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M11 2v2"></path><path d="M5 2v2"></path><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"></path><path d="M8 15a6 6 0 0 0 12 0v-3"></path><circle cx="20" cy="10" r="2"></circle></svg> 
                            Fonoaudiólogo(a) voluntário(a)
                          </div>
                          <p className="text-sm text-muted-foreground">Responda perguntas e edite a biblioteca. Sujeito a aprovação.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <InputField label="Seu nome completo" id="c-nome" required />
                  <InputField label="Email" id="c-email" type="email" required />
                  <InputField label="Senha (mínimo 6 letras)" id="c-senha" type="password" minLength={6} required />
                  
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md px-8 h-14 w-full text-lg font-bold mt-2" type="submit">
                    Criar conta
                  </button>
                </form>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-base text-muted-foreground">
            Sem cadastro? <a href="tela3.html" className="font-semibold text-primary hover:underline">Use o chat com IA</a>.
          </p>
        </div>
      </main>

      {/* FOOTER - Repetido nas 3 telas */}
      <footer className="mt-16 border-t border-border bg-secondary/40">
        <div className="container mx-auto max-w-6xl px-4 py-10 text-center text-base text-muted-foreground">
          <p className="font-semibold text-foreground">EscutaBem</p>
          <p className="mt-2">Apoio para quem usa aparelho auditivo do SUS.</p>
          <p className="mt-3">
            <a href="tela4.html" className="font-semibold text-primary hover:underline">É fonoaudiólogo(a) ou estagiário(a)? Seja voluntário</a>
          </p>
          <p className="mt-3 text-sm">As respostas deste site não substituem consulta com fonoaudiólogo. Em emergências, procure uma unidade de saúde.</p>
        </div>
      </footer>
    </div>
  );
}