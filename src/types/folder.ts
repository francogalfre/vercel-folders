export type Folder = {
    id: string;
    name: string;
    description: string;
    color: string;
    projects: string[];
};

export type FolderInput = Pick<Folder, "name" | "description" | "color">;
