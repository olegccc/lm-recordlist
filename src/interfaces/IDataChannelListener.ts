interface IDataChannelListener {
    recordRemoved: (id: number) => void;
    recordUpdated: (id: number) => void;
    recordCreated: (id: number, position: number) => void;
}
