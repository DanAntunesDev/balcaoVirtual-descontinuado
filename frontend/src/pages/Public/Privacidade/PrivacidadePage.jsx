import { useEffect, useMemo, useState } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import "./privacidade.css";

export default function PrivacidadePage() {
  const [activeSection, setActiveSection] = useState("coleta");

  const navItems = useMemo(
    () => [
      ["coleta", "database", "Coleta de Dados"],
      ["uso", "description", "Uso das Informações"],
      ["direitos", "how_to_reg", "Direitos do Usuário"],
      ["seguranca", "encrypted", "Segurança da Informação"],
      ["cookies", "cookie", "Cookies"],
      ["contato", "alternate_email", "DPO / Contato"],
    ],
    []
  );

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (!sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="priv-root">

      {/* HEADER EXTRAÍDO  */}
      <PublicHeader variant="privacy"
        showBack
        backTo="/login"
        links={[
          { to: "/suporte", label: "Suporte" },
        ]}
      />

      <main className="priv-main">
        <div className="priv-wrap">
          <div className="priv-card">
            {/* TOPO */}
            <div className="priv-top">
              <div className="priv-top-left">
                <span className="priv-badge">CONFORMIDADE LGPD</span>

                <h1 className="priv-title">
                  Política de Privacidade e Proteção de Dados
                </h1>

                <p className="priv-subtitle">
                  Lei Federal nº 13.709/2018 – Lei Geral de Proteção de Dados
                  Pessoais (LGPD)
                </p>
              </div>

              <div className="priv-secure">
                <span
                  className="material-symbols-outlined priv-secure-ico"
                  aria-hidden="true"
                >
                  shield
                </span>
                <span className="priv-secure-text">Navegação Segura</span>
              </div>
            </div>

            {/* GRID */}
            <div className="priv-grid">
              {/* MENU */}
              <aside className="priv-aside">
                <nav className="priv-nav">
                  <p className="priv-nav-title">Nesta página</p>

                  <div className="priv-nav-items">
                    {navItems.map(([id, icon, label]) => {
                      const isActive = activeSection === id;

                      return (
                        <a
                          key={id}
                          href={`#${id}`}
                          className={`priv-nav-link ${isActive ? "is-active" : ""
                            }`}
                        >
                          <span
                            className="material-symbols-outlined priv-nav-ico"
                            aria-hidden="true"
                          >
                            {icon}
                          </span>
                          {label}
                        </a>
                      );
                    })}
                  </div>
                </nav>
              </aside>

              {/* TEXTO */}
              <article className="priv-article">

                <p className="priv-intro">
                  A Rastrum Tecnologias atua como Controladora de Dados Pessoais nos termos da
                  Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD), comprometendo-se
                  com a transparência, segurança e integridade no tratamento das informações
                  pessoais de seus usuários.
                </p>

                {/* 1 */}
                <section id="coleta" className="priv-section">
                  <h3 className="priv-h3">
                    <span className="material-symbols-outlined priv-h3-ico">
                      add_circle
                    </span>
                    1. Coleta de Dados Pessoais
                  </h3>

                  <p className="priv-p">
                    Coletamos dados pessoais estritamente necessários à execução dos serviços
                    oferecidos pela plataforma, observando os princípios da finalidade,
                    adequação, necessidade e minimização previstos no Art. 6º da LGPD.
                  </p>

                  <ul className="priv-ul">
                    <li>Dados cadastrais: nome completo, CPF/CNPJ, e-mail e telefone;</li>
                    <li>Dados técnicos: endereço IP, data e hora de acesso, tipo de navegador;</li>
                    <li>Dados de autenticação e histórico de utilização da plataforma;</li>
                    <li>Informações relacionadas aos serviços notariais e registrais solicitados.</li>
                  </ul>
                </section>

                {/* 2 */}
                <section id="uso" className="priv-section">
                  <h3 className="priv-h3">
                    <span className="material-symbols-outlined priv-h3-ico">
                      settings_suggest
                    </span>
                    2. Finalidade e Base Legal do Tratamento
                  </h3>

                  <p className="priv-p">
                    O tratamento dos dados pessoais ocorre com fundamento nas bases legais
                    previstas no Art. 7º da LGPD, incluindo:
                  </p>

                  <ul className="priv-ul">
                    <li>Execução de contrato ou procedimentos preliminares;</li>
                    <li>Cumprimento de obrigação legal ou regulatória;</li>
                    <li>Exercício regular de direitos em processo judicial ou administrativo;</li>
                    <li>Legítimo interesse, quando aplicável.</li>
                  </ul>
                </section>

                {/* 3 */}
                <section id="direitos" className="priv-section">
                  <h3 className="priv-h3">
                    <span className="material-symbols-outlined priv-h3-ico">
                      verified
                    </span>
                    3. Direitos do Titular
                  </h3>

                  <p className="priv-p">
                    O titular poderá exercer, a qualquer momento, os direitos previstos no
                    Art. 18 da LGPD, incluindo:
                  </p>

                  <ul className="priv-ul">
                    <li>Confirmação da existência de tratamento;</li>
                    <li>Acesso aos dados;</li>
                    <li>Correção de dados incompletos ou desatualizados;</li>
                    <li>Anonimização, bloqueio ou eliminação;</li>
                    <li>Portabilidade dos dados;</li>
                    <li>Revogação do consentimento, quando aplicável.</li>
                  </ul>
                </section>

                {/* 4 */}
                <section id="seguranca" className="priv-section">
                  <h3 className="priv-h3">
                    <span className="material-symbols-outlined priv-h3-ico">
                      lock
                    </span>
                    4. Segurança da Informação
                  </h3>

                  <p className="priv-p">
                    Adotamos medidas técnicas e administrativas aptas a proteger os dados
                    pessoais contra acessos não autorizados, destruição, perda, alteração,
                    comunicação ou qualquer forma de tratamento inadequado.
                  </p>

                  <ul className="priv-ul">
                    <li>Criptografia de dados sensíveis;</li>
                    <li>Controle de acesso baseado em perfil;</li>
                    <li>Monitoramento de atividades;</li>
                    <li>Ambiente com protocolos HTTPS e certificação digital.</li>
                  </ul>
                </section>

                {/* 5 */}
                <section id="cookies" className="priv-section">
                  <h3 className="priv-h3">
                    <span className="material-symbols-outlined priv-h3-ico">
                      cookie
                    </span>
                    5. Cookies e Tecnologias de Rastreamento
                  </h3>

                  <p className="priv-p">
                    Utilizamos cookies essenciais para funcionamento da plataforma,
                    autenticação de usuários e melhoria da experiência. O usuário poderá
                    configurar seu navegador para bloqueio ou exclusão de cookies.
                  </p>
                </section>

                {/* 6 */}
                <section id="contato" className="priv-contact">
                  <h4 className="priv-h4">
                    <span className="material-symbols-outlined priv-h4-ico">
                      contact_support
                    </span>
                    Encarregado de Proteção de Dados (DPO)
                  </h4>

                  <p className="priv-p">
                    Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de
                    dados pessoais:
                  </p>

                  <p className="priv-contact-mail">
                    dpo@rastrum.com.br
                  </p>

                  <p className="priv-version">
                    Última atualização: Janeiro de 2024 – Versão 1.0
                  </p>
                </section>

              </article>
            </div>
          </div>

          <footer className="priv-footer">
            © 2024 Rastrum Tecnologias. Todos os direitos reservados.
          </footer>
        </div>
      </main>
    </div>
  )
}