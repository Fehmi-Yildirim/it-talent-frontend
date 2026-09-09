import { en } from './en';

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : string;
};

export const nl: DeepPartial<typeof en> = {
    navigation: {
        dashboard: 'Dashboard',
        findJobs: 'Vacatures zoeken',
        login: 'Inloggen',
        language: 'Taal',
        logout: 'Uitloggen',
        profile: 'Profiel',
        register: 'Registreren',
    },

    accessibility: {
        skipToMainContent: 'Ga naar hoofdinhoud',
        mainNavigation: 'Hoofdnavigatie',
    },

    adminUsers: {
        title: 'Admin — Gebruikersbeheer',
        loading: 'Gebruikers laden...',
        loadError: 'Gebruikers kunnen niet worden geladen.',
        updateError: 'Gebruiker kan niet worden bijgewerkt.',
        deleteError: 'Gebruiker kan niet worden verwijderd.',
        refresh: 'Vernieuwen',
        noUsers: 'Geen gebruikers gevonden',

        email: 'E-mail',
        role: 'Rol',
        status: 'Status',
        created: 'Aangemaakt',
        actions: 'Acties',

        candidate: 'Kandidaat',
        recruiter: 'Recruiter',
        admin: 'Admin',

        active: 'Actief',
        pending: 'In behandeling',
        suspended: 'Geschorst',
        deleted: 'Verwijderd',

        saving: 'Opslaan...',
        save: 'Opslaan',
        cancel: 'Annuleren',
        edit: 'Bewerken',
        delete: 'Verwijderen',

        deleteConfirmation:
            'Weet je zeker dat je deze gebruiker wilt verwijderen?',
    },

    auth: {
        login: 'Inloggen',
        register: 'Registreren',
        email: 'E-mail',
        password: 'Wachtwoord',
        accountType: 'Accounttype',
        candidate: 'Kandidaat',
        recruiter: 'Recruiter',
        emailRequired: 'E-mail is verplicht.',
        invalidEmail: 'Vul een geldig e-mailadres in.',
        passwordMinLength:
            'Wachtwoord moet minimaal 8 tekens bevatten.',
        loginFailed: 'Inloggen mislukt.',
        loggingIn: 'Bezig met inloggen...',
        registrationFailed: 'Registratie mislukt.',
        creatingAccount: 'Account wordt aangemaakt...',
        accountNotActive: 'Account is niet actief.',
    },

    buttons: {
        save: 'Opslaan',
        cancel: 'Annuleren',
    },

    candidateJobs: {
        eyebrow: 'Kandidaat',
        title: 'Vind je volgende kans',
        description:
            'Zoek gepubliceerde vacatures en filter ze op basis van je voorkeuren.',

        searchJobs: 'Vacatures zoeken',
        search: 'Zoeken',
        searchPlaceholder: 'Titel, beschrijving of bedrijf',
        location: 'Locatie',
        locationPlaceholder: 'Amsterdam',
        workMode: 'Werkvorm',
        allWorkModes: 'Alle werkvormen',
        employmentType: 'Dienstverband',
        allEmploymentTypes: 'Alle dienstverbanden',
        minimumSalary: 'Minimumsalaris',
        maximumSalary: 'Maximumsalaris',
        sort: 'Sorteren',

        newest: 'Nieuwste',
        salary: 'Salaris',
        titleSort: 'Titel',

        skills: 'Vaardigheden',
        loadingSkills: 'Vaardigheden laden...',
        noSkills: 'Geen vaardigheden beschikbaar.',

        fullTime: 'Fulltime',
        partTime: 'Parttime',
        contract: 'Contract',
        freelance: 'Freelance',
        internship: 'Stage',

        remote: 'Op afstand',
        hybrid: 'Hybride',
        onsite: 'Op locatie',
        flexible: 'Flexibel',

        clearFilters: 'Filters wissen',

        unableToLoadJobs:
            'Vacatures kunnen niet worden geladen',
        loadError:
            'Vacatures kunnen niet worden geladen. Probeer het opnieuw.',
        invalidSearch:
            'De zoekopdracht is ongeldig. Controleer je filters.',
        tryAgain: 'Opnieuw proberen',
        loadingJobs: 'Vacatures laden...',

        noJobsFound: 'Geen vacatures gevonden',
        noJobsMatch:
            'Geen gepubliceerde vacatures komen overeen met je huidige zoekopdracht en filters.',

        jobsFound: 'vacatures gevonden',
        jobFound: 'vacature gevonden',
        loadingPage: 'Pagina laden...',

        published: 'Gepubliceerd',
        viewJob: 'Vacature bekijken',

        pagination: 'Paginering van vacatureresultaten',
        previous: 'Vorige',
        next: 'Volgende',
        page: 'Pagina',
        of: 'van',

        from: 'Vanaf',
        upTo: 'Tot',
        notSpecified: 'Niet opgegeven',
    },

    candidateApplications: {
        eyebrow: 'Kandidaat',
        title: 'Mijn sollicitaties',
        description:
            'Bekijk de sollicitaties die je hebt ingediend en hun huidige status.',

        loading: 'Sollicitaties laden...',

        accessDenied: 'Toegang geweigerd',
        unauthorized:
            'Je hebt geen toegang om je sollicitaties te bekijken.',
        applicationsNotFound: 'Sollicitaties niet gevonden',
        notFoundDescription:
            'We konden je sollicitaties momenteel niet vinden.',
        unableToLoad:
            'Sollicitaties kunnen niet worden geladen',
        loadError:
            'Er is iets misgegaan bij het laden van je sollicitaties. Probeer het opnieuw.',
        tryAgain: 'Opnieuw proberen',

        noApplications: 'Nog geen sollicitaties',
        noApplicationsDescription:
            'Je hebt nog niet gesolliciteerd op vacatures. Bekijk beschikbare vacatures om je volgende kans te vinden.',
        browseJobs: 'Vacatures bekijken',

        application: 'sollicitatie',
        applications: 'sollicitaties',

        pending: 'In behandeling',
        reviewing: 'In beoordeling',
        accepted: 'Geaccepteerd',
        rejected: 'Afgewezen',
        withdrawn: 'Ingetrokken',

        applied: 'Gesolliciteerd',
        coverLetterSubmitted: 'Motivatiebrief ingediend',
        viewApplication: 'Sollicitatie bekijken',

        backToDashboard: 'Terug naar dashboard',

        details: {
            loading: 'Sollicitatie laden...',

            accessDenied: 'Toegang geweigerd',
            applicationNotFound: 'Sollicitatie niet gevonden',
            unableToLoad:
                'Sollicitatie kan niet worden geladen',

            unauthorized:
                'Je hebt geen toegang om deze sollicitatie te bekijken.',
            notFound:
                'De sollicitatie kon niet worden gevonden of is niet langer beschikbaar.',
            loadError:
                'Er is iets misgegaan bij het laden van deze sollicitatie. Probeer het later opnieuw.',

            backToApplications:
                'Terug naar sollicitaties',
            eyebrow: 'Sollicitatie van kandidaat',

            jobDetails: 'Vacaturegegevens',
            location: 'Locatie',
            workMode: 'Werkvorm',
            employmentType: 'Dienstverband',

            applicationDetails: 'Sollicitatiegegevens',
            status: 'Status',
            applied: 'Gesolliciteerd',
            lastUpdated: 'Laatst bijgewerkt',

            coverLetter: 'Motivatiebrief',

            withdrawApplication:
                'Sollicitatie intrekken',
            withdrawDescription:
                'Je kunt je sollicitatie intrekken zolang deze nog wordt verwerkt.',
            withdrawing: 'Intrekken...',
            withdrawConfirmation:
                'Weet je zeker dat je deze sollicitatie wilt intrekken?',
            withdrawUnauthorized:
                'Je hebt geen toestemming om deze sollicitatie in te trekken.',
            withdrawNotFound:
                'De sollicitatie kon niet worden gevonden.',
            withdrawError:
                'De sollicitatie kon niet worden ingetrokken. Probeer het opnieuw.',
        },
    },

    candidateJobDetails: {
        loading: 'Vacature laden...',
        jobNotFound: 'Vacature niet gevonden',
        unableToLoad:
            'Vacature kan niet worden geladen',
        jobUnavailable:
            'Deze vacature is niet meer beschikbaar of kon niet worden gevonden.',
        loadError:
            'Er is iets misgegaan bij het laden van deze vacature. Probeer het opnieuw.',
        tryAgain: 'Opnieuw proberen',
        backToJobs: 'Terug naar vacatures',

        jobOpportunity: 'Vacature',
        location: 'Locatie',
        workMode: 'Werkvorm',
        employmentType: 'Dienstverband',
        salary: 'Salaris',

        notSpecified: 'Niet opgegeven',
        from: 'Vanaf',
        upTo: 'Tot',

        aboutTheJob: 'Over de vacature',

        applyForThisJob:
            'Solliciteer op deze vacature',
        applicationSubmitted:
            'Sollicitatie ingediend',
        applicationSuccess:
            'Je hebt succesvol gesolliciteerd op deze vacature.',
        alreadyApplied: 'Al gesolliciteerd',
        alreadyAppliedDescription:
            'Je hebt al gesolliciteerd op deze vacature.',
        viewMyApplications:
            'Mijn sollicitaties bekijken',
        submitApplication:
            'Dien je sollicitatie voor deze functie in.',
        coverLetter: 'Motivatiebrief',
        optional: 'optioneel',
        coverLetterPlaceholder:
            'Vertel de recruiter waarom jij goed bij deze functie past...',
        submitting: 'Indienen...',
        applyNow: 'Nu solliciteren',
        submitError:
            'Je sollicitatie kon niet worden ingediend. Probeer het opnieuw.',
        submitUnexpectedError:
            'Er is iets misgegaan bij het indienen van je sollicitatie.',

        requiredSkills: 'Vereiste vaardigheden',
        noRequiredSkills:
            'Geen vereiste vaardigheden opgegeven.',
        preferredSkills: 'Gewenste vaardigheden',
        noPreferredSkills:
            'Geen gewenste vaardigheden opgegeven.',
        minimumLevel: 'Minimaal niveau',

        company: 'Bedrijf',
        name: 'Naam',
        website: 'Website',

        published: 'Gepubliceerd',
        expires: 'Verloopt',
    },

    dashboard: {
        loading: 'Dashboard laden...',
        unavailable: 'Dashboard niet beschikbaar',
        loadError:
            'Dashboard kan niet worden geladen. Probeer het opnieuw.',
        retry: 'Opnieuw proberen',

        title: 'Dashboard',
        eyebrow: 'IT Talent Dashboard',
        welcomeBack: 'Welkom terug',
        viewProfile: 'Profiel bekijken',

        candidate: {
            dashboardLabel: 'Kandidaatdashboard',
            profile: 'Profiel',
            complete: 'volledig',
            status: 'Status',
            editProfile: 'Profiel bewerken',
            applications: 'Sollicitaties',
            totalApplications:
                'Totaal aantal sollicitaties',
            viewApplications:
                'Sollicitaties bekijken',
            availableJobs: 'Beschikbare vacatures',
            recommended: 'aanbevolen',
            browseJobs: 'Vacatures bekijken',
            skills: 'Vaardigheden',
            skillsInProfile:
                'Vaardigheden in je profiel',
            manageProfile: 'Profiel beheren',
            applicationOverview:
                'Overzicht sollicitaties',
            applicationsByStatus:
                'Sollicitaties per status',
            recentApplications:
                'Recente sollicitaties',
            latestApplications:
                'Je laatste sollicitaties',
            viewAll: 'Alles bekijken',
            noApplications:
                'Je hebt nog geen sollicitaties ingediend.',
            recentJobs: 'Recente vacatures',
            latestOpportunities:
                'Laatste kansen',
            browseAll: 'Alles bekijken',
            noJobs:
                'Er zijn momenteel geen gepubliceerde vacatures beschikbaar.',
        },

        recruiter: {
            dashboardLabel: 'Recruiterdashboard',
            company: 'Bedrijf',
            noCompany: 'Geen bedrijf',
            status: 'Status',
            manageCompany: 'Bedrijf beheren',
            jobs: 'Vacatures',
            published: 'gepubliceerd',
            draft: 'concept',
            closed: 'gesloten',
            manageJobs: 'Vacatures beheren',
            applications: 'Sollicitaties',
            totalApplications:
                'Totaal aantal sollicitaties',
            viewApplications:
                'Sollicitaties bekijken',
            recruiter: 'Recruiter',
            editProfile: 'Profiel bewerken',
            applicationOverview:
                'Overzicht sollicitaties',
            applicationsByStatus:
                'Sollicitaties per status',
            recentApplications:
                'Recente sollicitaties',
            latestCandidates:
                'Laatste kandidaten',
            noApplications:
                'Er zijn nog geen sollicitaties ontvangen.',
            recentJobs: 'Recente vacatures',
            latestVacancies:
                'Laatste vacatures',
            noJobs:
                'Er zijn nog geen vacatures aangemaakt.',
            viewAll: 'Alles bekijken',
            candidate: 'Kandidaat',
        },

        admin: {
            administration: 'Administratie',
            tools: 'Admin-tools',
            description:
                'Beheer gebruikers en platformadministratie.',
            manageUsers: 'Gebruikers beheren',
        },

        account: {
            account: 'Account',
            yourAccount: 'Jouw account',
            email: 'E-mail',
            role: 'Rol',
            status: 'Status',
        },
    },

    errors: {
        pageNotFound: 'Pagina niet gevonden',
    },

    feedback: {
        somethingWentWrong: 'Er is iets misgegaan',
        tryAgain: 'Opnieuw proberen',
        loading: 'Laden...',
    },

    landing: {
        title: 'IT Talent',
        eyebrow: 'IT Talent Platform',
        subtitle:
            'Verbind talent met de juiste IT-kansen.',
        description:
            'IT Talent helpt kandidaten en recruiters met elkaar te verbinden via een gericht platform voor de IT-arbeidsmarkt.',
        goToDashboard: 'Ga naar dashboard',
        getStarted: 'Aan de slag',
        login: 'Inloggen',

        candidates: {
            label: 'Voor kandidaten',
            title: 'Bouw aan je IT-carrière',
            description:
                'Maak je profiel aan en presenteer je vaardigheden en ervaring aan potentiële werkgevers.',
            createAccount:
                'Maak je account aan',
        },

        recruiters: {
            label: 'Voor recruiters',
            title: 'Vind IT-talent',
            description:
                'Maak je recruiterprofiel aan en kom in contact met professionals voor je wervingsbehoeften.',
            getStarted: 'Aan de slag',
        },
    },

    profile: {
        title: 'Profiel',
        backToDashboard: 'Terug naar dashboard',

        account: 'Account',
        accountInformation:
            'Accountgegevens',
        email: 'E-mail',
        role: 'Rol',
        status: 'Status',

        candidate: 'Kandidaat',
        candidateProfile:
            'Kandidaatprofiel',
        createCandidateProfile:
            'Kandidaatprofiel aanmaken',
        editProfile: 'Profiel bewerken',

        loading:
            'Kandidaatprofiel laden...',
        profileUnavailable:
            'Profiel niet beschikbaar',

        headline: 'Koptekst',
        summary: 'Samenvatting',
        location: 'Locatie',
        minimumSalary: 'Minimumsalaris',
        maximumSalary: 'Maximumsalaris',
        salary: 'Salaris',
        currency: 'Valuta',
        availabilityDate:
            'Beschikbaarheidsdatum',
        availability: 'Beschikbaarheid',
        remotePreference:
            'Voorkeur voor werken op afstand',

        notSpecified: 'Niet opgegeven',
        upTo: 'Tot',
        from: 'Vanaf',

        saveProfile: 'Profiel opslaan',
        createProfile: 'Profiel aanmaken',
        saving: 'Opslaan...',
        cancel: 'Annuleren',

        profileUpdated:
            'Profiel succesvol bijgewerkt.',
        profileCreated:
            'Profiel succesvol aangemaakt.',

        unauthorizedAccess:
            'Je hebt geen toegang tot je kandidaatprofiel.',
        serverLoadError:
            'De server heeft een fout gemeld bij het laden van je kandidaatprofiel.',
        connectionError:
            'Kan geen verbinding maken met de server. Controleer je verbinding en probeer het opnieuw.',
        loadError:
            'Je kandidaatprofiel kan niet worden geladen.',

        unauthorizedModify:
            'Je hebt geen toestemming om je kandidaatprofiel te wijzigen.',
        invalidInformation:
            'Controleer je profielgegevens en probeer het opnieuw.',
        profileAlreadyExists:
            'Er bestaat al een kandidaatprofiel.',
        processingError:
            'De profielgegevens konden niet worden verwerkt. Controleer je invoer.',
        serverError:
            'De server heeft een fout gemeld. Probeer het later opnieuw.',
        updateError:
            'Je kandidaatprofiel kan niet worden bijgewerkt.',
        createError:
            'Je kandidaatprofiel kan niet worden aangemaakt.',
    },

    recruiterJobs: {
        title: 'Vacatures',
        description:
            'Beheer de vacatures van je bedrijf.',

        newJob: 'Nieuwe vacature',

        loading: 'Vacatures laden...',
        loadError:
            'Je vacatures kunnen niet worden geladen. Probeer het opnieuw.',
        tryAgain: 'Opnieuw proberen',

        noJobs: 'Nog geen vacatures',
        noJobsDescription:
            'Maak je eerste vacature aan om te beginnen met werven.',
        createFirstJob:
            'Maak je eerste vacature',

        yourJobs: 'Je vacatures',

        locationNotSpecified:
            'Locatie niet opgegeven',
        location: 'Locatie',

        salaryNotSpecified:
            'Salaris niet opgegeven',
        salary: 'Salaris',
        upTo: 'Tot',

        employmentType: 'Dienstverband',
        workMode: 'Werkvorm',
        notSpecified: 'Niet opgegeven',

        fullTime: 'Fulltime',
        partTime: 'Parttime',
        contract: 'Contract',
        freelance: 'Freelance',
        internship: 'Stage',

        remote: 'Op afstand',
        hybrid: 'Hybride',
        onsite: 'Op locatie',
        flexible: 'Flexibel',

        draft: 'Concept',
        published: 'Gepubliceerd',
        closed: 'Gesloten',

        view: 'Bekijken',
        edit: 'Bewerken',

        jobNotFound: 'Vacature niet gevonden.',
        jobIdMissing: 'Vacature-ID ontbreekt.',
        unableToLoadDetails:
            'Deze vacature kan niet worden geladen.',
        backToJobs: 'Terug naar vacatures',

        publish: 'Vacature publiceren',
        publishing: 'Publiceren...',
        close: 'Vacature sluiten',
        closing: 'Sluiten...',

        publishedSuccessfully:
            'Vacature succesvol gepubliceerd.',
        closedSuccessfully:
            'Vacature succesvol gesloten.',
        publishError:
            'De vacature kon niet worden gepubliceerd. Probeer het opnieuw.',
        closeError:
            'De vacature kon niet worden gesloten. Probeer het opnieuw.',

        jobDescription:
            'Vacatureomschrijving',
        jobInformation:
            'Vacaturegegevens',
        expirationDate:
            'Vervaldatum',

        requirements: 'Vereisten',
        requirementsDescription:
            'Vaardigheden die vereist of gewenst zijn voor deze functie.',
        manageRequirements:
            'Vereisten beheren',
        noRequirements:
            'Geen vereisten geconfigureerd.',
        requiredSkills:
            'Vereiste vaardigheden',
        preferredSkills:
            'Gewenste vaardigheden',
        minimumLevel:
            'Minimaal niveau',
        required: 'Vereist',
        preferred: 'Gewenst',

        jobDetails: 'Vacaturegegevens',
        jobTitle: 'Functietitel',
        titleRequired: 'Functietitel is verplicht.',
        descriptionRequired: 'Beschrijving is verplicht.',
        descriptionPlaceholder:
            'Beschrijf de functie, verantwoordelijkheden en verwachtingen...',
        jobTitlePlaceholder: 'bijv. Senior Frontend Developer',
        locationPlaceholder: 'bijv. Amsterdam, Nederland',

        salaryExpiration: 'Salaris & einddatum',
        salaryMin: 'Minimumsalaris',
        salaryMax: 'Maximumsalaris',
        currency: 'Valuta',

        jobRequirements: 'Functie-eisen',
        jobRequirementsDescription:
            'Voeg de vaardigheden toe waar kandidaten over moeten beschikken.',
        skill: 'Vaardigheid',
        selectSkill: 'Selecteer een vaardigheid',
        type: 'Type',
        addRequirement: 'Functie-eis toevoegen',
        delete: 'Verwijderen',
        unknownSkill: 'Onbekende vaardigheid',

        loadingRequirements: 'Functie-eisen laden...',
        noRequirementsAddedYet:
            'Nog geen functie-eisen toegevoegd.',
        noRequirementsHaveBeenAdded:
            'Er zijn nog geen functie-eisen toegevoegd.',
        requirementsWillBeCreated:
            'Deze functie-eisen worden via de Requirements API aangemaakt wanneer je de vacature opslaat.',
        editJob: 'Vacature bewerken',
        createJob: 'Vacature aanmaken',
        updateJobDescription:
            'Werk de gegevens van je vacature bij.',
        createJobDescription:
            'Maak een nieuwe vacature aan voor je bedrijf.',

        saving: 'Opslaan...',
        saveChanges: 'Wijzigingen opslaan',
        cancel: 'Annuleren',

        loadSkillsError: 'Vaardigheden kunnen niet worden geladen.',
        loadJobError: 'De vacature kan niet worden geladen.',
        loadRequirementsError:
            'Functie-eisen kunnen niet worden geladen.',
        selectSkillError: 'Selecteer een vaardigheid.',
        validSkillError:
            'Selecteer een geldige vaardigheid.',
        minimumLevelRangeError:
            'Het minimale niveau moet tussen 1 en 5 liggen.',
        duplicateSkillError:
            'Deze vaardigheid is al toegevoegd.',
        addRequirementError:
            'De functie-eis kan niet worden toegevoegd.',
        updateRequirementError:
            'De functie-eis kan niet worden bijgewerkt.',
        deleteRequirementError:
            'De functie-eis kan niet worden verwijderd.',
        validEmploymentTypeError:
            'Selecteer een geldig dienstverband.',
        validWorkModeError:
            'Selecteer een geldige werkvorm.',
        minimumSalaryNegative:
            'Het minimumsalaris kan niet negatief zijn.',
        maximumSalaryNegative:
            'Het maximumsalaris kan niet negatief zijn.',
        salaryRangeError:
            'Het minimumsalaris kan niet hoger zijn dan het maximumsalaris.',
        expirationPastError:
            'De einddatum kan niet in het verleden liggen.',
        invalidSkillIds:
            'Een of meer vaardigheids-ID’s zijn ongeldig.',
        minimumSkillLevelError:
            'Het minimale vaardigheidsniveau moet tussen 1 en 5 liggen.',
        jobCreatedRequirementsError:
            'De vacature is aangemaakt, maar een of meer functie-eisen konden niet worden opgeslagen.',
        updateJobError:
            'De vacature kan niet worden bijgewerkt.',
        createJobError:
            'De vacature kan niet worden aangemaakt.',
    },

    recruiterJobDetails: {
        loading: 'Vacature laden...',
    },

    recruiterJobForm: {
        loading: 'Vacature laden...',
        backToJobs: 'Terug naar vacatures',

        editTitle: 'Vacature bewerken',
        createTitle: 'Vacature aanmaken',

        editDescription:
            'Werk de gegevens van je vacature bij.',
        createDescription:
            'Maak een nieuwe vacature aan voor je bedrijf.',

        jobDetails: 'Vacaturegegevens',
        jobTitle: 'Functietitel',
        jobTitlePlaceholder:
            'bijv. Senior Frontend Developer',

        employmentType: 'Dienstverband',
        workMode: 'Werkvorm',

        location: 'Locatie',
        locationPlaceholder:
            'bijv. Amsterdam, Nederland',

        description: 'Beschrijving',
        descriptionPlaceholder:
            'Beschrijf de functie, verantwoordelijkheden en verwachtingen...',

        salaryAndExpiration: 'Salaris & einddatum',
        minimumSalary: 'Minimumsalaris',
        maximumSalary: 'Maximumsalaris',
        currency: 'Valuta',
        expirationDate: 'Vervaldatum',

        jobRequirements: 'Functie-eisen',
        requirementsDescription:
            'Voeg de vaardigheden toe waar kandidaten over moeten beschikken.',

        skill: 'Vaardigheid',
        selectSkill: 'Selecteer een vaardigheid',

        type: 'Type',
        required: 'Vereist',
        preferred: 'Gewenst',
        minimumLevel: 'Minimaal niveau',

        addRequirement: 'Functie-eis toevoegen',
        loadingRequirements: 'Functie-eisen laden...',
        noRequirementsYet:
            'Nog geen functie-eisen toegevoegd.',
        noRequirementsAdded:
            'Er zijn nog geen functie-eisen toegevoegd.',
        requirementsWillBeCreated:
            'Deze functie-eisen worden via de Requirements API aangemaakt wanneer je de vacature opslaat.',

        cancel: 'Annuleren',
        saving: 'Opslaan...',
        saveChanges: 'Wijzigingen opslaan',
        createJob: 'Vacature aanmaken',

        unknownSkill: 'Onbekende vaardigheid',

        unableToLoadSkills:
            'Vaardigheden kunnen niet worden geladen.',
        unableToLoadJob:
            'De vacature kan niet worden geladen.',
        unableToLoadRequirements:
            'Functie-eisen kunnen niet worden geladen.',

        selectSkillError:
            'Selecteer een vaardigheid.',
        invalidSkillError:
            'Selecteer een geldige vaardigheid.',
        minimumLevelError:
            'Het minimale niveau moet tussen 1 en 5 liggen.',
        duplicateSkillError:
            'Deze vaardigheid is al toegevoegd.',

        unableToAddRequirement:
            'De functie-eis kan niet worden toegevoegd.',
        unableToUpdateRequirement:
            'De functie-eis kan niet worden bijgewerkt.',
        unableToDeleteRequirement:
            'De functie-eis kan niet worden verwijderd.',

        titleRequired:
            'Functietitel is verplicht.',
        descriptionRequired:
            'Beschrijving is verplicht.',

        invalidEmploymentType:
            'Selecteer een geldig dienstverband.',
        invalidWorkMode:
            'Selecteer een geldige werkvorm.',

        minimumSalaryNegative:
            'Het minimumsalaris kan niet negatief zijn.',
        maximumSalaryNegative:
            'Het maximumsalaris kan niet negatief zijn.',
        minimumSalaryGreater:
            'Het minimumsalaris kan niet hoger zijn dan het maximumsalaris.',

        expirationPast:
            'De vervaldatum kan niet in het verleden liggen.',

        invalidSkillIds:
            'Een of meer vaardigheids-ID’s zijn ongeldig.',
        minimumSkillLevel:
            'Het minimale vaardigheidsniveau moet tussen 1 en 5 liggen.',

        jobCreatedRequirementsFailed:
            'De vacature is aangemaakt, maar een of meer functie-eisen konden niet worden opgeslagen.',

        unableToUpdateJob:
            'De vacature kan niet worden bijgewerkt.',
        unableToCreateJob:
            'De vacature kan niet worden aangemaakt.',
    },

    recruiterApplications: {
        eyebrow: 'Recruiter',
        title: 'Sollicitaties',
        description:
            'Bekijk sollicitaties die op je vacatures zijn ingediend.',

        loading: 'Sollicitaties laden...',

        accessDenied: 'Toegang geweigerd',
        unauthorized:
            'Je hebt geen toegang om sollicitaties op je vacatures te bekijken.',
        unableToLoad:
            'Sollicitaties kunnen niet worden geladen',
        loadError:
            'Er is iets misgegaan bij het laden van de sollicitaties. Probeer het later opnieuw.',

        filters:
            'Filters voor sollicitaties',
        job: 'Vacature',
        allJobs: 'Alle vacatures',
        status: 'Status',
        allStatuses: 'Alle statussen',

        pending: 'In behandeling',
        reviewing: 'In beoordeling',
        accepted: 'Geaccepteerd',
        rejected: 'Afgewezen',
        withdrawn: 'Ingetrokken',

        noApplications:
            'Geen sollicitaties gevonden',
        noApplicationsMatch:
            'Geen sollicitaties komen overeen met de geselecteerde filters.',

        applied: 'Gesolliciteerd',
        coverLetterIncluded:
            'Motivatiebrief toegevoegd',
        details: {
            loading: 'Sollicitatie laden...',
            accessDenied: 'Toegang geweigerd',
            applicationNotFound: 'Sollicitatie niet gevonden',
            unableToLoad:
                'Sollicitatie kan niet worden geladen',

            unauthorized:
                'Je hebt geen toegang om deze sollicitatie te bekijken.',
            notFound:
                'De sollicitatie kon niet worden gevonden.',
            loadError:
                'Er is iets misgegaan bij het laden van deze sollicitatie.',

            backToApplications:
                'Terug naar sollicitaties',
            eyebrow: 'Sollicitatie van recruiter',

            application: 'Sollicitatie',
            status: 'Status',
            applied: 'Gesolliciteerd',
            lastUpdated: 'Laatst bijgewerkt',

            candidate: 'Kandidaat',
            name: 'Naam',
            coverLetter: 'Motivatiebrief',

            updateStatus: 'Status bijwerken',
            accept: 'Accepteren',
            reject: 'Afwijzen',
            updatingStatus:
                'Status bijwerken...',

            updateUnauthorized:
                'Je hebt geen toestemming om deze sollicitatie bij te werken.',
            invalidStatus:
                'Deze sollicitatiestatus is ongeldig.',
            updateError:
                'De status van de sollicitatie kan niet worden bijgewerkt.',
        },
    },
};