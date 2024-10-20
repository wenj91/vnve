import { DirectiveInput } from "./DirectiveInput";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialogue, Text } from "@vnve/next-core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { SaveAsTemplateDialog } from "../TemplateLibrary";
import { Icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SceneDetail() {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);

  const handleAddDialogue = (index?: number) => {
    editor.addDialogue(
      {
        speaker: {
          name: "",
          label: "",
        },
        lines: [],
      },
      index,
    );
  };

  const handleInsertDialogue = (index: number, dialogue: Dialogue) => {
    editor.addDialogue(
      {
        speaker: editor.cloneDialogueSpeaker(dialogue),
        lines: [],
      },
      index,
    );
  };

  const handleChangeSceneName = (value: string) => {
    editor.updateActiveScene((scene) => {
      scene.label = value;
    });
  };

  const handleUpdateDialogue = (index: number, value: Dialogue) => {
    editor.updateDialogue(index, value);
    // 单向同步至画布元素，只改变画布中的值
    if (activeScene) {
      const { name, text } = activeScene.config.speak?.target || {};

      if (value.speaker.label) {
        const nameChild = editor.activeScene.getChildByName(name) as Text;

        nameChild.text = value.speaker.label;
      }

      if (value.lines.length > 0) {
        const textChild = editor.activeScene.getChildByName(text) as Text;
        // TODO: 切换时，activeScene更新了，editor.activeScene还没有更新
        console.log(
          "textChild",
          textChild,
          activeScene.children.find((item) => item.name === text),
        );
        let speakText = "";

        value.lines.forEach((line) => {
          if (line.type === "p") {
            for (let index = 0; index < line.children.length; index++) {
              const child = line.children[index];

              if (!child.type) {
                let text = child.text;

                if (index === line.children.length - 1) {
                  // 最后一个元素是文本，增加换行符
                  text += "\n";
                }

                speakText += text;
              }
            }
          }
        });

        if (speakText) {
          textChild.text = speakText;
        }
      }
    }
  };

  const handleCopyDialogue = (dialogue: Dialogue, index?: number) => {
    const clonedDialogue = editor.cloneDialogue(dialogue);

    editor.addDialogue(clonedDialogue, index);
  };

  const handleSwapDialogue = (fromIndex: number, toIndex: number) => {
    editor.swapDialogue(fromIndex, toIndex);
  };

  return (
    <>
      {activeScene && (
        <Card className="w-full flex-1 h-full rounded-md">
          <CardContent className="h-full p-2">
            <ScrollArea className="w-full h-full pr-2">
              <div className="flex flex-col m-1 mr-0 pr-1">
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="sceneName"
                    className="flex justify-between items-center"
                  >
                    <span>场景名称</span>
                    <SaveAsTemplateDialog sceneName={activeScene.name}>
                      <Button size="sm" variant="outline">
                        保存为模版
                      </Button>
                    </SaveAsTemplateDialog>
                  </Label>
                  <Input
                    type="text"
                    id="sceneName"
                    placeholder="请输入场景名称"
                    value={activeScene.label}
                    onChange={(event) =>
                      handleChangeSceneName(event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Label>场景对白</Label>
                  {activeScene.dialogues.map((dialogue, index) => {
                    return (
                      <div key={index}>
                        <DirectiveInput
                          value={dialogue}
                          onChange={(value) => {
                            handleUpdateDialogue(index, value);
                          }}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Icons.more className="size-4 cursor-pointer mx-1" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleInsertDialogue(index + 1, dialogue)
                                }
                              >
                                插入
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCopyDialogue(dialogue, index + 1)
                                }
                              >
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  editor.removeDialogue(dialogue);
                                }}
                              >
                                删除
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {index > 0 && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSwapDialogue(index, index - 1)
                                  }
                                >
                                  上移
                                </DropdownMenuItem>
                              )}

                              {index < activeScene.dialogues.length - 1 && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSwapDialogue(index, index + 1)
                                  }
                                >
                                  下移
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </DirectiveInput>
                      </div>
                    );
                  })}
                </div>
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => handleAddDialogue()}
                >
                  新增对白
                </Button>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </>
  );
}
