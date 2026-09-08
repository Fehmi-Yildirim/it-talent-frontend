import { en } from './en';

export const nl: {
    [K in keyof typeof en]: {
        [P in keyof typeof en[K]]: string;
    };
} = {
    navigation: {
        dashboard: 'Dashboard',
        findJobs: 'Vacatures zoeken',
        profile: 'Profiel',
        login: 'Inloggen',
        register: 'Registreren',
        logout: 'Uitloggen',
    },
};