import {
  UserProfile,
  Announcement,
  QuickLink,
  DocumentFile,
  CalendarEvent,
  HelpdeskTicket,
  RoomBooking,
  AuditLog,
  Poll,
  WikiArticle,
  NotificationItem,
  VacationNotice
} from '../types';


export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Carlos Alberto Mendonça',
    email: 'cpduniccat@gmail.com',
    role: 'Administrador',
    department: 'Tecnologia da Informação',
    phone: '(11) 3456-7800',
    extension: '101',
    mobile: '(11) 98765-4321',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    active: true,
    birthDate: '1985-08-15',
    hireDate: '2018-03-10',
    bio: 'Gestor de TI e Infraestrutura de Redes na UNICCAT.',
    location: 'Unidade Matriz - São Paulo',
    password: 'senha123',
    lastLogin: '2026-08-06 13:45',
    createdAt: '2022-01-01'
  },
  {
    id: 'usr-2',
    name: 'Dra. Mariana Silva Ribeiro',
    email: 'mariana.ribeiro@uniccat.com.br',
    role: 'Médico',
    department: 'Medicina Ocupacional',
    phone: '(11) 3456-7802',
    extension: '205',
    mobile: '(11) 99887-1122',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    active: true,
    birthDate: '1982-08-18',
    hireDate: '2019-05-12',
    bio: 'Médica do Trabalho Coordenadora do PCMSO.',
    location: 'Unidade Matriz',
    lastLogin: '2026-08-06 11:20',
    createdAt: '2022-01-15'
  },
  {
    id: 'usr-3',
    name: 'Fernanda Albuquerque',
    email: 'rh@uniccat.com.br',
    role: 'RH',
    department: 'Recursos Humanos',
    phone: '(11) 3456-7805',
    extension: '102',
    mobile: '(11) 97654-3210',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    active: true,
    birthDate: '1990-08-22',
    hireDate: '2020-02-01',
    bio: 'Coordenadora de Recursos Humanos e Endomarketing.',
    location: 'Unidade Matriz',
    lastLogin: '2026-08-06 12:00',
    createdAt: '2022-02-01'
  },
  {
    id: 'usr-4',
    name: 'Eng. Ricardo Vasconcelos',
    email: 'seguranca@uniccat.com.br',
    role: 'Coordenador',
    department: 'Segurança do Trabalho',
    phone: '(11) 3456-7810',
    extension: '108',
    mobile: '(11) 98112-3344',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    active: true,
    birthDate: '1988-09-04',
    hireDate: '2021-06-15',
    bio: 'Engenheiro de Segurança do Trabalho e responsável PGR/LTCAT.',
    location: 'Unidade Matriz',
    lastLogin: '2026-08-05 17:30',
    createdAt: '2022-03-01'
  },
  {
    id: 'usr-5',
    name: 'Patricia Lima Soares',
    email: 'recepcao@uniccat.com.br',
    role: 'Recepção',
    department: 'Recepção & Atendimento',
    phone: '(11) 3456-7801',
    extension: '100',
    mobile: '(11) 99443-2211',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    active: true,
    birthDate: '1995-08-10',
    hireDate: '2023-01-10',
    bio: 'Recepcionista sênior e atendimento ao cliente e exames presenciais.',
    location: 'Unidade Matriz - Térreo',
    lastLogin: '2026-08-06 08:00',
    createdAt: '2023-01-10'
  },
  {
    id: 'usr-6',
    name: 'Roberto Godoy',
    email: 'comercial@uniccat.com.br',
    role: 'Comercial',
    department: 'Comercial',
    phone: '(11) 3456-7820',
    extension: '104',
    mobile: '(11) 98877-6655',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    active: true,
    birthDate: '1984-11-12',
    hireDate: '2019-11-01',
    bio: 'Gerente Comercial Corporativo para contratos de Saúde Ocupacional.',
    location: 'Unidade Matriz',
    lastLogin: '2026-08-06 10:15',
    createdAt: '2022-01-10'
  }
];

export const INITIAL_QUICK_LINKS: QuickLink[] = [
  {
    id: 'ql-1',
    title: 'Site Institucional',
    description: 'Portal oficial da UNICCAT Medicina e Segurança do Trabalho',
    url: 'https://www.uniccat.com.br',
    iconName: 'Globe',
    category: 'Portais',
    isOfficial: true,
    order: 1,
    openInNewTab: true,
    favoritesCount: 42
  },
  {
    id: 'ql-2',
    title: 'Infomed',
    description: 'Sistema de Gestão Médica Ocupacional e Exames Internos',
    url: 'http://192.168.0.7/infomed/',
    iconName: 'Activity',
    category: 'Sistemas Internos',
    isOfficial: true,
    order: 2,
    openInNewTab: true,
    badge: 'Rede Local',
    favoritesCount: 89
  },
  {
    id: 'ql-3',
    title: 'MedClinic',
    description: 'Plataforma de Atendimento Clínico e Laudos MedClinic',
    url: 'http://192.168.0.49/medclinic_uniccat/comum/login.php',
    iconName: 'Stethoscope',
    category: 'Sistemas Internos',
    isOfficial: true,
    order: 3,
    openInNewTab: true,
    badge: 'Rede Local',
    favoritesCount: 76
  },
  {
    id: 'ql-4',
    title: 'Webmail UNICCAT',
    description: 'Acesso ao E-mail Corporativo e Calendário Institucional',
    url: 'https://webmail.uniccat.com.br/',
    iconName: 'Mail',
    category: 'Ferramentas',
    isOfficial: true,
    order: 4,
    openInNewTab: true,
    favoritesCount: 95
  },
  {
    id: 'ql-5',
    title: 'Assistente.net',
    description: 'Plataforma Integrada de Gestão de Documentos e eSocial',
    url: 'https://plataforma.assistente.net.br/auth/login',
    iconName: 'FileCheck',
    category: 'Sistemas Internos',
    isOfficial: true,
    order: 5,
    openInNewTab: true,
    favoritesCount: 68
  },
  {
    id: 'ql-6',
    title: 'Secullum Ponto Web',
    description: 'Autenticação e Registro de Ponto Eletrônico dos Colaboradores',
    url: 'https://autenticador.secullum.com.br/Authorization?client_id=3001&response_type=code&redirect_uri=https%3A%2F%2Fpontoweb.secullum.com.br%2FAuth',
    iconName: 'Clock',
    category: 'RH',
    isOfficial: true,
    order: 6,
    openInNewTab: true,
    badge: 'Ponto',
    favoritesCount: 112
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Campanha SIPAT 2026: Saúde, Ergonomia e Bem-Estar na UNICCAT',
    summary: 'Participe da nossa Semana Interna de Prevenção de Acidentes de Trabalho com palestras, workshops e exames preventivos.',
    content: `Prezados colaboradores,

É com grande satisfação que anunciamos o lançamento da **SIPAT 2026** da UNICCAT Medicina e Segurança do Trabalho.

### Programação Principal:
* **Segunda-feira (08:30):** Abertura Oficial e Palestra "Ergonomia no Ambiente Corporativo".
* **Terça-feira (10:00):** Workshop Prático de Gestão de Estresse e Saúde Mental.
* **Quarta-feira (14:00):** Atualização dos Protocolos do eSocial e Segurança Ocupacional.
* **Quinta-feira (09:00):** Blitz da Postura com nossa equipe de Fisioterapia.
* **Sexta-feira (15:00):** Encerramento, Sorteio de Prêmios e Coffe Break Especial.

Contamos com a presença e engajamento de todas as equipes! Lembre-se de confirmar sua presença com o RH até o dia 10.`,
    category: 'Campanhas',
    priority: 'Urgente',
    pinned: true,
    authorId: 'usr-3',
    authorName: 'Fernanda Albuquerque',
    authorRole: 'Coordenadora de RH',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    publishDate: '2026-08-05',
    expirationDate: '2026-08-30',
    allowComments: true,
    requiresReadConfirmation: true,
    readBy: ['usr-1', 'usr-2'],
    attachments: [
      {
        name: 'Programacao_Completa_SIPAT_2026.pdf',
        type: 'pdf',
        url: '#',
        size: '1.8 MB'
      }
    ],
    comments: [
      {
        id: 'cm-1',
        announcementId: 'anc-1',
        userId: 'usr-2',
        userName: 'Dra. Mariana Silva Ribeiro',
        userPhotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
        content: 'Excelente iniciativa! A equipe médica participará ativamente da blitz de postura.',
        createdAt: '2026-08-05 14:30'
      }
    ],
    createdAt: '2026-08-05 10:00'
  },
  {
    id: 'anc-2',
    title: 'Atualização dos Servidores e Sistema Infomed / MedClinic',
    summary: 'Manutenção programada na infraestrutura de TI no próximo sábado das 22h às 02h.',
    content: `Informamos a todos os usuários dos sistemas Infomed e MedClinic que realizaremos uma manutenção preventiva e atualização de segurança em nossos servidores locais no sábado.

Durante este período, o acesso aos sistemas locais pode apresentar breves instabilidades. Pedimos que salvem suas digitações e consultas médicas pendentes antes do horário agendado.

Dúvidas podem ser encaminhadas via chamado para a equipe de TI.`,
    category: 'Comunicados Urgentes',
    priority: 'Alta',
    pinned: false,
    authorId: 'usr-1',
    authorName: 'Carlos Alberto Mendonça',
    authorRole: 'Gestor de TI',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    publishDate: '2026-08-06',
    allowComments: true,
    requiresReadConfirmation: false,
    readBy: ['usr-1', 'usr-3', 'usr-5'],
    createdAt: '2026-08-06 09:15'
  },
  {
    id: 'anc-3',
    title: 'Boas-Vindas aos Novos Colaboradores de Agosto',
    summary: 'Damos as boas-vindas aos novos profissionais que passaram a integrar a família UNICCAT neste mês.',
    content: `Com muita alegria apresentamos os novos membros da nossa equipe:

* **Lucas Siqueira:** Técnico de Segurança do Trabalho
* **Beatriz Mendes:** Enfermeira do Trabalho
* **Tiago Rocha:** Analista Financeiro

Desejamos a todos muito sucesso e uma jornada gratificante na UNICCAT!`,
    category: 'Novos Colaboradores',
    priority: 'Normal',
    pinned: false,
    authorId: 'usr-3',
    authorName: 'Fernanda Albuquerque',
    authorRole: 'Recursos Humanos',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    publishDate: '2026-08-01',
    allowComments: true,
    requiresReadConfirmation: false,
    readBy: ['usr-1', 'usr-2', 'usr-3', 'usr-4'],
    createdAt: '2026-08-01 08:00'
  }
];

export const INITIAL_DOCUMENTS: DocumentFile[] = [
  {
    id: 'doc-1',
    title: 'Manual do Colaborador & Código de Conduta UNICCAT',
    description: 'Guia completo sobre normas internas, benefícios, jornada de trabalho e diretrizes éticas.',
    category: 'Manuais',
    fileType: 'pdf',
    fileSize: '3.4 MB',
    downloadUrl: '#',
    authorName: 'Recursos Humanos',
    department: 'Recursos Humanos',
    version: '2026.1',
    downloadsCount: 124,
    mandatoryReading: true,
    confirmedReaders: ['usr-1', 'usr-2'],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10'
  },
  {
    id: 'doc-2',
    title: 'POP-MED-004: Protocolo de Exame Admissional e Demissional',
    description: 'Procedimento Operacional Padrão para triagem e recepção de exames ocupacionais.',
    category: 'POP',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    downloadUrl: '#',
    authorName: 'Dra. Mariana Ribeiro',
    department: 'Medicina Ocupacional',
    version: 'v3.2',
    downloadsCount: 88,
    mandatoryReading: true,
    confirmedReaders: ['usr-2', 'usr-5'],
    createdAt: '2026-03-15',
    updatedAt: '2026-05-20'
  },
  {
    id: 'doc-3',
    title: 'Formulário de Solicitação de Reembolso de Despesas',
    description: 'Modelo em Excel para prestação de contas de deslocamentos e despesas de viagens corporativas.',
    category: 'Formulários',
    fileType: 'excel',
    fileSize: '450 KB',
    downloadUrl: '#',
    authorName: 'Departamento Financeiro',
    department: 'Financeiro & Administrativo',
    version: 'v1.5',
    downloadsCount: 210,
    mandatoryReading: false,
    createdAt: '2025-11-01',
    updatedAt: '2026-02-10'
  },
  {
    id: 'doc-4',
    title: 'Manual de Atendimento ao Cliente e Protocolo de Exames',
    description: 'Guia do Atendimento ao Paciente e Agendamento da Recepção.',
    category: 'Qualidade',
    fileType: 'word',
    fileSize: '2.1 MB',
    downloadUrl: '#',
    authorName: 'Patricia Lima',
    department: 'Recepção & Atendimento',
    version: 'v2.0',
    downloadsCount: 65,
    mandatoryReading: true,
    confirmedReaders: ['usr-5'],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-01'
  },
  {
    id: 'doc-5',
    title: 'Apresentação Institucional UNICCAT 2026',
    description: 'Slide deck oficial para reuniões comerciais e apresentações para novos clientes.',
    category: 'Comercial',
    fileType: 'powerpoint',
    fileSize: '12.8 MB',
    downloadUrl: '#',
    authorName: 'Roberto Godoy',
    department: 'Comercial',
    version: '2026.2',
    downloadsCount: 94,
    mandatoryReading: false,
    createdAt: '2026-02-15',
    updatedAt: '2026-06-01'
  }
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Abertura Oficial SIPAT 2026',
    description: 'Palestra magna sobre Ergonomia e Saúde Mental no Trabalho no auditório principal.',
    category: 'Campanha',
    startDate: '2026-08-10',
    time: '08:30',
    location: 'Auditório Matriz UNICCAT',
    organizer: 'RH & CIPA',
    isAllDay: false
  },
  {
    id: 'evt-2',
    title: 'Treinamento eSocial S-2220 e S-2240',
    description: 'Capacitação interna para lançamento de ASOs e Laudos Ambientais no sistema Assistente.net.',
    category: 'Treinamento',
    startDate: '2026-08-14',
    time: '14:00',
    location: 'Sala de Treinamento 2',
    department: 'Segurança do Trabalho',
    organizer: 'Eng. Ricardo',
    isAllDay: false
  },
  {
    id: 'evt-3',
    title: 'Dia dos Pais - Café Especial na Empresa',
    description: 'Café da manhã comemorativo em homenagem aos pais da UNICCAT.',
    category: 'Evento',
    startDate: '2026-08-12',
    time: '09:00',
    location: 'Refeitório Central',
    organizer: 'RH',
    isAllDay: false
  },
  {
    id: 'evt-4',
    title: 'Aniversário de Patricia Lima (Recepção)',
    description: 'Comemoração dos aniversariantes da semana na recepção.',
    category: 'Aniversário',
    startDate: '2026-08-10',
    time: '16:00',
    location: 'Recepção Matriz',
    organizer: 'RH',
    isAllDay: false
  }
];

export const INITIAL_TICKETS: HelpdeskTicket[] = [
  {
    id: 'tkt-1',
    code: 'UNIC-1024',
    title: 'Instalação do certificado digital na maquina da Dra. Mariana',
    description: 'Necessário instalar novo e-CPF/e-CNPJ para assinatura eletrônica dos laudos do Infomed.',
    category: 'TI',
    priority: 'Alta',
    status: 'Em Andamento',
    requesterId: 'usr-2',
    requesterName: 'Dra. Mariana Silva Ribeiro',
    requesterDepartment: 'Medicina Ocupacional',
    assignedTo: 'usr-1',
    assignedToName: 'Carlos Alberto Mendonça',
    comments: [
      {
        id: 'tc-1',
        ticketId: 'tkt-1',
        userId: 'usr-1',
        userName: 'Carlos Mendonça',
        userPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        content: 'Agendado atendimento presencial hoje às 14h30 no consultório 02.',
        createdAt: '2026-08-06 10:30'
      }
    ],
    createdAt: '2026-08-06 09:00',
    updatedAt: '2026-08-06 10:30'
  },
  {
    id: 'tkt-2',
    code: 'UNIC-1025',
    title: 'Solicitação de Crachá Adicional para Novo Estagiário',
    description: 'Solicito confecção de crachá e cadastro de biometria para a equipe do comercial.',
    category: 'RH',
    priority: 'Média',
    status: 'Aberto',
    requesterId: 'usr-6',
    requesterName: 'Roberto Godoy',
    requesterDepartment: 'Comercial',
    comments: [],
    createdAt: '2026-08-06 11:10',
    updatedAt: '2026-08-06 11:10'
  }
];

export const INITIAL_BOOKINGS: RoomBooking[] = [
  {
    id: 'bk-1',
    resourceName: 'Sala de Reunião Principal (12 pessoas)',
    type: 'Sala de Reunião',
    date: '2026-08-07',
    startTime: '10:00',
    endTime: '11:30',
    reservedBy: 'Roberto Godoy',
    userDepartment: 'Comercial',
    purpose: 'Reunião de Apresentação de Proposta Comercial com Cliente Indústria X',
    status: 'Confirmado',
    createdAt: '2026-08-05'
  },
  {
    id: 'bk-2',
    resourceName: 'Veículo Fiat Argo (Placa ABC-1234)',
    type: 'Veículo Corporativo',
    date: '2026-08-10',
    startTime: '08:00',
    endTime: '17:00',
    reservedBy: 'Eng. Ricardo Vasconcelos',
    userDepartment: 'Segurança do Trabalho',
    purpose: 'Visita técnica de medição ambiental e PGR em cliente parceiro',
    status: 'Confirmado',
    createdAt: '2026-08-06'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    userId: 'usr-1',
    userName: 'Carlos Alberto Mendonça',
    action: 'LOGIN',
    details: 'Autenticação bem-sucedida via e-mail no painel administrativo.',
    ipAddress: '192.168.0.105',
    timestamp: '2026-08-06 13:45:12'
  },
  {
    id: 'aud-2',
    userId: 'usr-3',
    userName: 'Fernanda Albuquerque',
    action: 'CRIAR_COMUNICADO',
    details: 'Publicou o comunicado "Campanha SIPAT 2026".',
    ipAddress: '192.168.0.112',
    timestamp: '2026-08-05 10:00:04'
  },
  {
    id: 'aud-3',
    userId: 'usr-2',
    userName: 'Dra. Mariana Silva Ribeiro',
    action: 'DOWNLOAD_DOC',
    details: 'Efetuou download do arquivo POP-MED-004.',
    ipAddress: '192.168.0.120',
    timestamp: '2026-08-05 15:22:18'
  }
];

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'poll-1',
    question: 'Qual tema você prefere para o próximo treinamento interno da UNICCAT?',
    description: 'Sua opinião ajuda o RH a planejar as capacitações com maior impacto.',
    category: 'RH & Desenvolvimento',
    type: 'standard',
    active: true,
    endDate: '2026-08-20',
    votedUserIds: ['usr-1', 'usr-3'],
    authorName: 'Ana Paula Silva (RH)',
    createdAt: '2026-08-01',
    options: [
      { id: 'opt-1', text: 'Atualização das NRs e eSocial em 2026', votes: 14 },
      { id: 'opt-2', text: 'Comunicação Não-Violenta e Atendimento ao Paciente', votes: 9 },
      { id: 'opt-3', text: 'Gestão do Tempo e Ferramentas Digitais', votes: 11 },
      { id: 'opt-4', text: 'Primeiros Socorros Avançados e RCP', votes: 18 }
    ]
  },
  {
    id: 'form-1',
    question: 'Pesquisa Geral de Clima Organizacional UNICCAT 2026',
    description: 'Formulário oficial do Google Forms para avaliação do ambiente de trabalho, liderança e motivação.',
    category: 'Gestão de Pessoas',
    type: 'google_forms',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_CLIMA_2026/viewform?embedded=true',
    active: true,
    endDate: '2026-08-30',
    votedUserIds: [],
    options: [],
    responsesCount: 42,
    authorName: 'Coordenação de RH',
    createdAt: '2026-08-02',
    embeddedFormQuestions: [
      {
        id: 'q1',
        title: 'Como você avalia a comunicação interna entre o seu setor e a diretoria?',
        type: 'rating',
        required: true
      },
      {
        id: 'q2',
        title: 'Você sente que possui as ferramentas necessárias para desempenhar sua função com segurança?',
        type: 'choice',
        options: ['Sim, totalmente', 'Parcialmente', 'Não, preciso de novos equipamentos'],
        required: true
      },
      {
        id: 'q3',
        title: 'Sugestões de melhoria para o seu ambiente de trabalho ou setor:',
        type: 'text',
        required: false
      }
    ]
  },
  {
    id: 'form-2',
    question: 'Avaliação da Qualidade do Atendimento e Suporte de T.I.',
    description: 'Pesquisa de satisfação quanto ao tempo de resposta dos chamados, cordialidade dos técnicos e infraestrutura de rede.',
    category: 'Tecnologia da Informação',
    type: 'google_forms',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_IT_SUPPORTE/viewform?embedded=true',
    active: true,
    endDate: '2026-09-15',
    votedUserIds: [],
    options: [],
    responsesCount: 28,
    authorName: 'Gerência de T.I.',
    createdAt: '2026-08-03',
    embeddedFormQuestions: [
      {
        id: 'q1',
        title: 'Como você classifica o atendimento do suporte de TI no seu último chamado?',
        type: 'rating',
        required: true
      },
      {
        id: 'q2',
        title: 'O seu problema com sistemas (Infomed/MedClinic) foi resolvido dentro do prazo esperado?',
        type: 'choice',
        options: ['Sim, rapidamente', 'Dentro do prazo normal', 'Demorou mais que o esperado', 'Não foi resolvido'],
        required: true
      },
      {
        id: 'q3',
        title: 'Espaço aberto para elogios ou críticas construtivas ao setor de TI:',
        type: 'text',
        required: false
      }
    ]
  },
  {
    id: 'tpl-1',
    question: '[Modelo Google Forms] Pesquisa de Avaliação de Treinamentos & Capacitações',
    description: 'Modelo pronto e padronizado para feedback de cursos, palestras e workshops na UNICCAT.',
    category: 'RH & Desenvolvimento',
    type: 'template',
    isTemplate: true,
    templateCategory: 'Capacitação',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_MODELO_TREINAMENTO/viewform?embedded=true',
    active: true,
    endDate: '2026-12-31',
    votedUserIds: [],
    options: [],
    responsesCount: 115,
    authorName: 'Equipe de T&D',
    createdAt: '2026-07-20',
    embeddedFormQuestions: [
      {
        id: 'q1',
        title: 'O conteúdo apresentado atendeu às suas expectativas profissionais?',
        type: 'rating',
        required: true
      },
      {
        id: 'q2',
        title: 'Como você avalia a didática e o domínio do palestrante/instrutor?',
        type: 'rating',
        required: true
      },
      {
        id: 'q3',
        title: 'O material de apoio disponibilizado foi útil?',
        type: 'choice',
        options: ['Excelente', 'Bom', 'Regular', 'Ruim / Inexistente'],
        required: true
      }
    ]
  },
  {
    id: 'tpl-2',
    question: '[Modelo Google Forms] Pesquisa de Satisfação com Plano de Saúde e Benefícios',
    description: 'Modelo para mapear o nível de aprovação dos colaboradores em relação a convênio médico, vale refeição e parcerias.',
    category: 'Benefícios RH',
    type: 'template',
    isTemplate: true,
    templateCategory: 'Benefícios',
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_MODELO_BENEFICIOS/viewform?embedded=true',
    active: true,
    endDate: '2026-12-31',
    votedUserIds: [],
    options: [],
    responsesCount: 89,
    authorName: 'Gestão de Benefícios',
    createdAt: '2026-07-15',
    embeddedFormQuestions: [
      {
        id: 'q1',
        title: 'Qual benefício oferecido pela UNICCAT você mais utiliza no seu dia a dia?',
        type: 'choice',
        options: ['Plano de Saúde Médico/Odontológico', 'Vale Alimentação / Refeição', 'Parceria com Academias', 'Seguro de Vida'],
        required: true
      },
      {
        id: 'q2',
        title: 'Nível de satisfação geral com a rede credenciada do plano médico:',
        type: 'rating',
        required: true
      }
    ]
  }
];

export const INITIAL_WIKI: WikiArticle[] = [
  {
    id: 'wiki-1',
    title: 'Guia de Acesso aos Sistemas Locais (Infomed e MedClinic)',
    category: 'Tecnologia da Informação',
    summary: 'Instruções passo a passo para conectar-se aos servidores locais da UNICCAT.',
    content: `### 1. Requisitos de Rede
Para acessar o Infomed (192.168.0.7) e o MedClinic (192.168.0.49), seu computador deve estar conectado à rede local de cabos da UNICCAT ou à Wi-Fi Corporativa.

### 2. Navegadores Recomendados
Recomendamos o uso do **Google Chrome** ou **Microsoft Edge** para melhor compatibilidade com a impressão de guias e eSocial.

### 3. Em caso de senha bloqueada
Encaminhe um chamado via aba **Chamados Internos** selecionando a categoria TI.`,
    author: 'Equipe de TI UNICCAT',
    updatedAt: '2026-07-15',
    views: 342,
    tags: ['Infomed', 'MedClinic', 'TI', 'Rede Local']
  },
  {
    id: 'wiki-2',
    title: 'Procedimento para Agendamento de Consultas e Exames Admissionais',
    category: 'Medicina Ocupacional',
    summary: 'Como proceder com exames urgentes e emissão do ASO.',
    content: `### Fluxo de Atendimento
1. Verifique se o cliente possui contrato ativo e requisição no Assistente.net.
2. Encaminhe o colaborador para a recepção para triagem de pressão e acuidade visual.
3. Encaminhe ao consultório médico para emissão do ASO digital com certificado.`,
    author: 'Dra. Mariana Ribeiro',
    updatedAt: '2026-06-10',
    views: 189,
    tags: ['ASO', 'Recepção', 'Exames', 'Medicina']
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Novo Comunicado RH',
    message: 'A SIPAT 2026 foi anunciada! Confira a programação completa.',
    type: 'announcement',
    read: false,
    linkUrl: '#announcements',
    createdAt: '2026-08-05 10:05'
  },
  {
    id: 'notif-2',
    title: 'Manutenção de TI',
    message: 'Manutenção agendada nos servidores Infomed neste sábado.',
    type: 'system',
    read: true,
    linkUrl: '#announcements',
    createdAt: '2026-08-06 09:15'
  },
  {
    id: 'notif-3',
    title: 'Aniversariante do Dia',
    message: 'Hoje é aniversário de Patricia Lima (Recepção)! Mande seus parabéns.',
    type: 'birthday',
    read: false,
    linkUrl: '#phonebook',
    createdAt: '2026-08-10 08:00'
  }
];

export const INITIAL_VACATION_NOTICES: VacationNotice[] = [
  {
    id: 'vac-1',
    employeeId: 'usr-2',
    employeeName: 'Dra. Mariana Silva Ribeiro',
    employeePhotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    department: 'Medicina Ocupacional',
    role: 'Médico',
    startDate: '2026-08-01',
    endDate: '2026-08-15',
    daysCount: 15,
    status: 'Em Andamento',
    substituteName: 'Dr. Roberto Camargo',
    substitutePhone: '(11) 98877-6655',
    notes: 'Acomodação de atendimentos e homologações de ASO redirecionados para a equipe médica de plantão.',
    createdBy: 'Fernanda Albuquerque (RH)',
    createdAt: '2026-07-20 09:30'
  },
  {
    id: 'vac-2',
    employeeId: 'usr-5',
    employeeName: 'Patricia Lima Soares',
    employeePhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    department: 'Recepção & Atendimento',
    role: 'Recepção',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    daysCount: 30,
    status: 'Programada',
    substituteName: 'Juliana Paes (Atendimento)',
    substitutePhone: '(11) 3456-7801',
    notes: 'Período integral de férias referente ao período aquisitivo 2024/2025. Escala da recepção ajustada.',
    createdBy: 'Fernanda Albuquerque (RH)',
    createdAt: '2026-07-25 14:15'
  },
  {
    id: 'vac-3',
    employeeId: 'usr-4',
    employeeName: 'Eng. Ricardo Vasconcelos',
    employeePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    department: 'Segurança do Trabalho',
    role: 'Coordenador',
    startDate: '2026-10-10',
    endDate: '2026-10-25',
    daysCount: 15,
    status: 'Programada',
    substituteName: 'Téc. Lucas Andrade',
    substitutePhone: '(11) 97766-5544',
    notes: 'Acompanhamento de laudos PGR/LTCAT sob responsabilidade do técnico Lucas durante a ausência.',
    createdBy: 'Fernanda Albuquerque (RH)',
    createdAt: '2026-08-01 11:00'
  }
];

