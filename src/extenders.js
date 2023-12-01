Array.prototype.quicksort = function quickSort() {
    if(this.length <= 1) {
        return this;
    }

    const pivot = this[this.length - 1];
    const left = [];
    const right = [];

    for(let i = 0; i < this.length - 1; i++) {
        if(this[i] < pivot) {
            left.push(this[i]);
        } else {
            right.push(this[i]);
        }
    }

    return [...quickSort(left), pivot, ...quickSort(right)];
}