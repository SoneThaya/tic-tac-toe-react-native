import React, {
    createContext,
    ReactElement,
    ReactNode,
    useContext,
    useState,
    useEffect
} from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const difficulties = {
    "1": "Beginner",
    "3": "Intermediate",
    "4": "Hard",
    "-1": "Impossible"
};

type SettingsType = {
    difficulty: keyof typeof difficulties;
    haptics: boolean;
    sounds: boolean;
};

const defaultSettings: SettingsType = {
    difficulty: "-1",
    haptics: true,
    sounds: true
};

type SettingsContextType = {
    settings: SettingsType | null;
    loadSettings: () => void;
    saveSetting: <T extends keyof SettingsType>(settings: T, value: SettingsType[T]) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider.");
    }
    return context;
}

function SettingsProvider(props: { children: ReactNode }): ReactElement {
    const [settings, setStettings] = useState<SettingsType | null>(null);

    const saveSetting = async <T extends keyof SettingsType>(
        setting: T,
        value: SettingsType[T]
    ) => {
        try {
            const oldSettings = settings ? settings : defaultSettings;
            const newSettings = { ...oldSettings, [setting]: value };
            const jsonSettings = JSON.stringify(newSettings);
            await AsyncStorage.setItem("@settings", jsonSettings);
            setStettings(newSettings);
        } catch (error) {
            Alert.alert("Error!", "An error has occured!");
        }
    };

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem("@settings");
            settings !== null ? setStettings(JSON.parse(settings)) : setStettings(defaultSettings);
        } catch (error) {
            setStettings(defaultSettings);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return <SettingsContext.Provider {...props} value={{ settings, saveSetting, loadSettings }} />;
}

export { useSettings, SettingsProvider, difficulties };
