import { useState } from "react";

/*
  Eu importo aqui os componentes de cada domínio de cadastro.
  Esses componentes já existem e já encapsulam suas próprias
  tabelas, hooks e modais.
*/
import CategoriasDocumentos from "./CategoriasDocumentos/CategoriasDocumentos";
import Profissionais from "./Profissionais/Profissionais";
import TiposAgendamentos from "./TiposAgendamentos/TiposAgendamentos";

/*
  Eu sou a página principal do módulo Cadastros do SuperAdmin.
  Minha responsabilidade é apenas organizar os cadastros
  em uma tela única com abas.
*/
export default function CadastrosPage() {
  /*
    Estado que controla qual aba está ativa.
    Eu uso estado local para evitar navegação por rota
    e manter a UX mais rápida.
  */
  const [activeTab, setActiveTab] = useState("categorias");

  /*
    Defino as abas de forma centralizada.
    Assim fica simples adicionar novos cadastros no futuro.
  */
  const tabs = [
    {
      key: "categorias",
      label: "Categorias de Documento",
      component: <CategoriasDocumentos />,
    },
    {
      key: "profissionais",
      label: "Profissionais",
      component: <Profissionais />,
    },
    {
      key: "tipos-agendamento",
      label: "Tipos de Agendamento",
      component: <TiposAgendamentos />,
    },
  ];

  /*
    Eu identifico qual aba está ativa para renderizar
    o componente correto.
  */
  const currentTab = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho principal da página */}
      <header>
        <h1 className="text-xl font-semibold">Cadastros</h1>
      </header>

      {/* Navegação por abas */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              /*
                Aqui eu aplico apenas estados visuais.
                Não crio cores, tokens ou estilos novos.
              */
              className={`
                px-4 py-2 text-sm font-medium
                border-b-2 transition-colors
                ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da aba ativa */}
      <section className="pt-4">
        {/*
          Aqui eu simplesmente renderizo o componente
          do cadastro ativo.
          Toda a lógica interna fica isolada no domínio.
        */}
        {currentTab.component}
      </section>
    </div>
  );
}
