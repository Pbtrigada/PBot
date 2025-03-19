export class Queue<T> {
    private storage: T[] = [];
    enqueue(item: T): void {
        this.storage.push(item);
    }
    dequeue(count: number = 1): T[] {
        return this.storage.splice(0, count);
    }
}