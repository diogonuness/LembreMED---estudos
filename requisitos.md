### **Requisitos do Software LembreMED (Versão Refinada)**

#### **1. Requisitos Funcionais (RF)**

Estes requisitos descrevem as funcionalidades e comportamentos que o sistema deve executar.

**Módulo 1: Gestão de Usuários (Cuidador, Médico, Familiar)**
*   **RF01 - Gestão de Perfis:** O sistema deve permitir a criação de contas para gestores (cuidadores, médicos, etc.) e o cadastro de múltiplos pacientes sob sua responsabilidade, incluindo dados pessoais e contatos de emergência.
*   **RF02 - Registro de Saúde:** O gestor deve poder registrar diagnósticos de doenças e associar os medicamentos correspondentes a cada uma.
*   **RF03 - Configuração de Tratamento:** O sistema deve permitir que o gestor configure os detalhes do tratamento, incluindo nome do medicamento, dosagem, frequência e horários de administração.
*   **RF04 - Monitoramento de Adesão:** O gestor deve ter acesso a um painel (dashboard) para monitorar em tempo real a adesão do paciente ao tratamento, visualizando doses confirmadas, atrasadas ou omitidas.

**Módulo 2: Paciente (Interface de Autonomia)**
*   **RF05 - Cadastro de Medicamento Guiado:** O sistema deve fornecer um fluxo guiado (wizard, passo a passo) para que o paciente possa cadastrar novos medicamentos de forma simples e intuitiva.
*   **RF06 - Interface Visual para Cadastro:** A interface deve permitir a seleção da forma farmacêutica (ex: comprimido, gotas) e dosagem por meio de ícones grandes e claros.
*   **RF07 - Agendamento Semiautomatizado:** Ao informar a hora da primeira dose, o sistema deve sugerir automaticamente os horários subsequentes, permitindo ajuste manual pelo paciente.
*   **RF08 - Confirmação de Ingestão Simplificada:** O paciente deve poder confirmar a ingestão do medicamento através de múltiplos canais, como a notificação na tela de bloqueio ou diretamente no aplicativo.

**Módulo 3: Administração e Segurança do Sistema**
*   **RF09 - Curadoria de Dados:** Novos medicamentos ou doenças cadastrados por usuários que não existam na base de dados principal devem passar pela aprovação de um Administrador antes de serem disponibilizados para todos.
*   **RF10 - Alertas de Atraso Escalonados:** Caso uma dose não seja confirmada em 30 minutos, o dispositivo do paciente deve emitir alertas sonoros com intensidade progressiva.
*   **RF11 - Notificação de Emergência:** Se o atraso na ingestão da medicação persistir, o sistema deve notificar automaticamente os contatos de emergência cadastrados.
*   **RF12 - Log de Auditoria:** Todas as interações com os medicamentos (ingestão, atraso, omissão) devem ser registradas em um histórico imutável para fins de auditoria e consulta médica.

---

#### **2. Requisitos Não Funcionais (RNF)**

Estes requisitos definem os padrões de qualidade e a operação técnica do sistema.

*   **RNF01 - Usabilidade e Acessibilidade:** A interface destinada ao paciente deve seguir diretrizes de acessibilidade, incluindo fontes com tamanho mínimo de 18px, alto contraste de cores e ícones universalmente reconhecíveis.
*   **RNF02 - Confiabilidade e Disponibilidade:** O sistema deve operar com uma disponibilidade de 99.9%, minimizando qualquer risco associado à falha em notificações de saúde.
*   **RNF03 - Segurança e Privacidade de Dados:** Os dados sensíveis dos usuários devem ser criptografados e o sistema deve estar em conformidade com a Lei Geral de Proteção de Dados (LGPD).
*   **RNF04 - Desempenho de Notificações:** O atraso máximo entre o horário programado e a entrega da notificação de medicação no dispositivo do usuário não deve exceder 30 segundos.
*   **RNF05 - Compatibilidade Multiplataforma:** O aplicativo deve ser compatível com Android (versão 8.0 ou superior) e iOS (versão 13 ou superior), adaptando-se a diferentes resoluções de tela.
