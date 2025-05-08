import { v4 as uuidv4 } from "uuid";
import { IdentificatorGenerator } from "./identificator-generator";

const generator = new IdentificatorGenerator();

export const generateToken = (date: number | null = null) =>
    `${(uuidv4() + "." + uuidv4()).replace(/-/g, "")}.${(
        date ?? Date.now()
    ).toString(36)}`;

export const generateId = () => generator.generate();
