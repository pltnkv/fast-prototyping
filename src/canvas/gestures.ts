let r1
let r2

function Point(x, y) // constructor
{
    this.X = x;
    this.Y = y;
}

export function init() {
    r1 = new NDollarRecognizer(false);
    r2 = new NDollarRecognizer(false);

    let useBoundedRotationInvariance = false

    r1.AddGesture("textLine", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0)],
        [new Point(120, 0), new Point(121, 0)]
    ])
    r1.AddGesture("headLine", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(0, 20)],
        [new Point(0, 20), new Point(100, 20)],
        [new Point(120, 20), new Point(121, 20)]
    ])
    r1.AddGesture("button", useBoundedRotationInvariance, [
        [new Point(0, 30), new Point(0, 0)],
        [new Point(0, 0), new Point(100, 0)]
    ])
    r1.AddGesture("rectangle", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0)],
        [new Point(100, 0), new Point(100, 70)],
        [new Point(100, 70), new Point(0, 70)],
        [new Point(0, 70), new Point(0, 0)]
    ])
    r1.AddGesture("line", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0)],
        [new Point(100, 0), new Point(15, 7)]
    ])
    // r1.AddGesture("vline", useBoundedRotationInvariance, [
    // 	[new Point(0, 0), new Point(0, 100)],
    // 	[new Point(0, 100), new Point(7, 15)]
    // ])
    r1.AddGesture("circle", useBoundedRotationInvariance, [
        [new Point(345, 9), new Point(345, 87)],
        [new Point(351, 8), new Point(386, 14),
            new Point(400, 50), new Point(386, 78), new Point(355, 88)]
    ])
    r1.AddGesture("erase", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0)],
        [new Point(100, 0), new Point(15, 7)],
        [new Point(15, 7), new Point(100, 7)],
        [new Point(100, 7), new Point(100, 14)]
    ])
    r1.AddGesture("textField", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(0, 30)],
        [new Point(0, 30), new Point(130, 30)],
        [new Point(130, 0), new Point(130, 0)]
    ])
    r1.AddGesture("comboBox", useBoundedRotationInvariance, [
        [new Point(0, 15), new Point(100, 15)],
        [new Point(100, 15), new Point(125, 45)],
        [new Point(125, 45), new Point(140, 15)]
    ])

    /////////////////////////////
    // 2+ strokes (and rectangle)
    /////////////////////////////

    r2.AddGesture("rectangle", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(100, 0)],
        [new Point(100, 0), new Point(100, 70)],
        [new Point(100, 70), new Point(0, 70)],
        [new Point(0, 70), new Point(0, 0)]
    ])
    r2.AddGesture("paragraph", useBoundedRotationInvariance, [
        [new Point(0, 0), new Point(160, 0)],
        [new Point(0, 80), new Point(160, 80)]
    ])
    r2.AddGesture("picture", useBoundedRotationInvariance, [
        [new Point(30, 146), new Point(106, 222)],
        [new Point(30, 225), new Point(106, 146)]
    ])

    r2.AddGesture("arrow", useBoundedRotationInvariance, [
        [new Point(0, 15), new Point(100, 15)],
        [new Point(85, 0), new Point(105, 15)],
        [new Point(105, 15), new Point(85, 30)]
    ])
}

export function recognize(strokes) {
    console.log(strokes.length)
    if (strokes.length === 1) {
        return r1.Recognize(strokes,
            false, //useBoundedRotationInvariance
            false, //requireSameNoOfStrokes
            false); //useProtractor
    } else {
        return r2.Recognize(strokes,
            false, //useBoundedRotationInvariance
            false, //requireSameNoOfStrokes
            false); //useProtractor
    }
}
