import {
  Scene,
  Text,
  Power0,
  Converter,
  Img,
  ImgSource,
  ISoundOption,
  Sound,
  Graphics,
} from "@vnve/core";
import {
  DEFAULT_WORDS_PER_MINUTE,
  LINE_GAP_TIME,
  getChildFromChildren,
  readingTime,
} from "../Utils";

interface ILine {
  start?: number;
  duration?: number;
  content: string;
}

type LineDisplayEffectType = "typewriter" | "fadeIn" | "none";

interface IMonologueSceneOptions {
  lines: ILine[];
  soundSources?: ISoundOption[];
  backgroundImgSource?: ImgSource;
  wordsPerMinute?: number;
  lineDisplayEffect?: LineDisplayEffectType;
}

export class MonologueScene extends Scene {
  public backgroundImg?: Img;
  public lineText?: Text;
  public lines: ILine[];
  public wordsPerMinute?: number;
  public lineDisplayEffect: LineDisplayEffectType;

  constructor(options: IMonologueSceneOptions) {
    super({ duration: 0 });

    this.type = "MonologueScene";
    this.wordsPerMinute = options.wordsPerMinute || DEFAULT_WORDS_PER_MINUTE;
    this.lineDisplayEffect = options.lineDisplayEffect || "typewriter";

    const maskRect = new Graphics();
    maskRect.alpha = 0.7;
    maskRect.beginFill(0x000000);
    maskRect.drawRect(0, 0, Converter.width(1920), Converter.height(1080));
    maskRect.endFill();
    maskRect.x = 0;
    maskRect.y = 0;
    this.addChild(maskRect);

    const lineText = new Text("独白台词", {
      fill: 0xffffff,
      breakWords: true,
      wordWrap: true,
      wordWrapWidth: Converter.width(1600),
      fontSize: Converter.fontSize(45),
      leading: 15,
    });

    lineText.x = Converter.x(160);
    lineText.y = Converter.y(160);

    this.addChild(lineText);
    this.lineText = lineText;
    this.lines = [];
    this.setLines(options.lines);

    if (options.backgroundImgSource) {
      this.setBackgroundImg(new Img({ source: options.backgroundImgSource }));
    }

    if (options.soundSources) {
      options.soundSources.forEach((item) => {
        const sound = new Sound(item);

        this.addSound(sound);
      });
    }
  }

  public setBackgroundImg(backgroundImg: Img) {
    backgroundImg.width = Converter.width(1920);
    backgroundImg.height = Converter.height(1080);
    backgroundImg.x = 0;
    backgroundImg.y = 0;

    this.removeBackgroundImg();
    this.backgroundImg = backgroundImg;
    this.addChild(backgroundImg);
    this.setChildToBottom(backgroundImg);
  }

  public removeBackgroundImg() {
    if (this.backgroundImg) {
      this.removeChild(this.backgroundImg);
      this.backgroundImg = undefined;
    }
  }

  public setLines(lines: ILine[]) {
    this.lines = lines;
    this.clearLinesAnimation();
    this.setLinesAnimation(lines);

    const duration = this.getLinesDuration();
    this.setDuration(duration);
  }

  public getLinesDuration() {
    if (this.lines.length === 0) {
      return 0;
    }

    const lastLine = this.lines[this.lines.length - 1];

    return lastLine.start! + lastLine.duration!;
  }

  public getLinePositionStartTime(lineIndex: number, position: number) {
    const line = this.lines[lineIndex];
    let startTime = line.start!;

    startTime += readingTime(
      line.content.slice(0, position),
      this.wordsPerMinute,
    );

    return startTime;
  }

  public clearLinesAnimation() {
    this.lineText?.removeAllAnimation();
  }

  public setLinesAnimation(lines: ILine[]) {
    lines.forEach((line, index) => {
      const lineReadingTime = readingTime(line.content, this.wordsPerMinute);

      line.duration = lineReadingTime;
      line.start =
        index === 0
          ? 0
          : lines[index - 1].start! +
              lines[index - 1].duration! +
              LINE_GAP_TIME || 0;

      if (this.lineDisplayEffect === "typewriter") {
        this.lineText?.addAnimation({
          value: [
            {
              text: "",
            },
            {
              text: line.content,
              duration: line.duration,
              delay: line.start,
              ease: Power0.easeNone,
            },
          ],
        });
      } else if (this.lineDisplayEffect === "fadeIn") {
        this.lineText?.addAnimation({
          value: [
            {
              text: line.content,
              alpha: 0,
            },
            {
              alpha: 1,
              duration:
                line.duration < LINE_GAP_TIME ? line.duration : LINE_GAP_TIME,
              delay: line.start,
            },
          ],
        });
      } else if (this.lineDisplayEffect === "none") {
        this.lineText?.addAnimation({
          value: [
            {
              text: "",
            },
            {
              text: line.content,
              delay: line.start,
            },
          ],
        });
      }
    });
  }

  public clone() {
    const cloned = new MonologueScene({
      lines: this.lines.map((item) => ({ ...item })),
      lineDisplayEffect: this.lineDisplayEffect,
      wordsPerMinute: this.wordsPerMinute,
    });

    cloned.removeChildren();
    cloned.cloneFrom(this);

    cloned.lineText = getChildFromChildren(cloned.children, this.lineText);
    cloned.backgroundImg = getChildFromChildren(
      cloned.children,
      this.backgroundImg,
    );

    return cloned;
  }
}
