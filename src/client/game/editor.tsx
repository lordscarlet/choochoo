import { Button } from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { UserRole } from "../../api/user";
import { environment, Stage } from "../services/environment";
import { useGame, useSetGameData } from "../services/game";
import { useMe } from "../services/me";


export function Editor() {
  const me = useMe();
  const game = useGame();
  const canEdit = environment.stage === Stage.enum.development;
  const canRead = canEdit || me?.role === UserRole.enum.ADMIN;
  if (!canRead) return <></>;
  const content = useMemo(() => {
    return JSON.stringify(JSON.parse(game.gameData!), null, 2)
  }, [game]);
  const [isOpen, setIsOpen] = useState(false);
  const [newContent, setNewContent] = useState({ content, version: game.version });
  const { setGameData, isPending } = useSetGameData();

  const setNewContentFromTextArea = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setNewContent(({ content: e.target.value, version: game.version }));
  }, [setNewContent, game.version]);

  const actualContent = game.version > newContent.version ? content : newContent.content;

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  const submit = useCallback(() => {
    const confirmed = confirm('Are you sure? This can seriously fuck up your game and there\'s no undo');
    if (!confirmed) return;
    setGameData(JSON.stringify(JSON.parse(actualContent)));
  }, [actualContent, setGameData]);

  return <>
    <Button onClick={toggle}>{isOpen ? 'Close editor' : 'Edit'}</Button>

    {isOpen && <textarea value={actualContent} onChange={setNewContentFromTextArea} disabled={!canEdit} />}
    {isOpen && canEdit && <Button onClick={submit} disabled={isPending}>Submit</Button>}
  </>;
}