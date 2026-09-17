import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck } from 'lucide-react';

const SECOES = [
  {
    titulo: '1. Introdução',
    texto: `Usar tecnologia a favor da sua audição deve ser simples. Se você acabou de receber seu aparelho, tem dúvidas sobre manutenção ou busca dicas para uma adaptação mais confortável, está no lugar certo.

O AjudaÁudio é uma iniciativa social dedicada a oferecer suporte acessível, informações claras e orientações práticas para usuários de aparelhos auditivos e seus cuidadores.`,
    itens: [
      'Guia de Adaptação: Dicas para os primeiros meses de uso.',
      'Cuidados diários: Como limpar, armazenar e prolongar a vida do seu aparelho.',
      'Apoio e Comunidade: Respostas para as suas principais dúvidas.',
    ],
  },
  {
    titulo: '2. Quais dados coletamos',
    texto: `Para realizar o cadastro e login no site, a AjudaAúdio coleta os seguintes dados pessoais dos beneficiários:`,
    itens: [
      'Nome completo',
      'E-mail',
      'Senha (armazenada de forma criptografada)',
      'Data de nascimento',
      'Número do cartão do SUS',
      'Modelo do aparelho auditivo',
      'Lado de uso do aparelho (direito, esquerdo ou bilateral)',
    ],
    textoApos: `
    2.1 Dados sensíveis
Informamos que o número do cartão do SUS, o modelo do aparelho auditivo e o lado de uso são considerados dados sensíveis de saúde, nos termos do artigo 5º, inciso II, da Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Por esse motivo, esses dados recebem tratamento diferenciado, com medidas de segurança reforçadas e coleta mediante consentimento específico e destacado do titular.

2.2 Dados de menores de idade
Caso o beneficiário seja menor de 18 anos, a coleta de seus dados pessoais e sensíveis somente será realizada mediante consentimento específico e em destaque de ao menos um dos pais ou do responsável legal, conforme o artigo 14 da LGPD.`,
  },
  {
    titulo: '3. Como usamos os seus dados',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '4. Com quem compartilhamos seus dados',
    texto: `O compartilhamento é limitado ao necessário para a prestação do serviço:

    Equipe de Administração AjudaÁudio: Acessamos suas informações apenas para gestão técnica, auditoria e manutenção da plataforma.

    Fonoaudiólogos e Estagiários Voluntários: Profissionais aprovados recebem acesso aos dados do seu perfil (como modelo do aparelho e histórico da sessão) apenas durante o atendimento humano.

    Proteção Técnica de Credenciais: Sua senha é criptografada no banco, o que significa que ninguém — nem administradores, nem voluntários — tem acesso à sua senha original.

    Não Compartilhamento Externo: Não realizamos transferência ou difusão dos seus dados para terceiros, parceiros comerciais ou empresas de publicidade.`,
  },
  {
    titulo: '5. Seus direitos (LGPD)',
    texto: `Como Titular dos dados, a Lei Geral de Proteção de Dados (LGPD) garante a você pleno controle sobre suas informações. Você pode exercer os seguintes direitos a qualquer momento:

    Confirmação e Acesso: Solicitar a confirmação de que realizamos o Tratamento dos seus dados e acessar as informações do seu cadastro.

    Correção: Pedir a alteração imediata de dados incompletos, inexatos ou desatualizados (como e-mail, cartão SUS ou modelo do aparelho).

    Oposição ao Tratamento: Direito de se opor ao Tratamento de seus Dados Pessoais em situações específicas onde você não concorde com a forma como a informação é utilizada.

    Eliminação: Solicitar a exclusão definitiva do seu cadastro e das suas mensagens da base de dados da plataforma.

    Transparência e Informação: Solicitar esclarecimentos adicionais sobre as medidas de Segurança adotadas e a forma como seus dados são manuseados internamente.
`,
  },
  {
    titulo: '6. Segurança dos dados',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '7. Termos de Uso da Plataforma',
    texto: 'FAZER TEXTO',
  },
  {
    titulo: '8. Isenção de responsabilidade médica',
    texto: `Apenas para Fins Informativos: Tudo o que você encontrar neste site, como textos, imagens e gráficos, serve apenas para educar e informar você.

Não Substitui Aconselhamento Médico: Nada do que está escrito aqui deve ser usado como um diagnóstico ou como um tratamento médico. Se você tiver qualquer dúvida sobre sua saúde ou tratamentos, procure sempre o seu médico ou um profissional de saúde qualificado.

Casos de Emergência: Se você sentir que está passando por uma emergência médica, ligue logo para o seu médico ou para o serviço de emergência local (como o SAMU pelo número 192).

Isenção de Garantias: Nunca deixe de seguir os conselhos do seu médico ou demore para procurar ajuda por causa de algo que você leu neste site. Você deve entender que usar as informações fornecidas por esta página é por sua conta e risco.
`,
  },
  {
    titulo: '9. Contato',
    texto: `Se você tiver qualquer dúvida ou questionamento sobre nosso Aviso de Privacidade ou sobre o tratamento dos seus Dados pela Ajuda Áudio, entre em contato conosco pelo email de contato disponibilizado abaixo.
    
    interlagos.escuderia@gmail.com`,
  },
];

export default function Privacidade() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-8 h-8 text-[#0d9488]" />
          <h1 className="text-3xl font-extrabold text-slate-900">Política de Privacidade e Termos de Uso</h1>
        </div>
        <p className="text-sm text-slate-500 mb-10">Última atualização: 09/09/2026</p>

        <div className="space-y-8">
          {SECOES.map((secao) => (
            <section key={secao.titulo}>
              <h2 className="text-lg font-bold text-slate-800 mb-2">{secao.titulo}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{secao.texto}</p>
              {secao.itens && (
                <ul className="mt-3 space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed">
                  {secao.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {secao.textoApos && (
                <p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">{secao.textoApos}</p>
              )}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
