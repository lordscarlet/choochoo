import { Button } from "@mui/material";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useGame, useSetGameData } from "../services/game";
import { useIsAdmin } from "../services/me";


export function Editor() {
  const isAdmin = useIsAdmin();
  const game = useGame();
  const canRead = isAdmin;
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

  if (!canRead) return <></>;

  return <>
    <Button onClick={toggle}>{isOpen ? 'Close editor' : 'Edit'}</Button>

    {isOpen && <textarea value={actualContent} onChange={setNewContentFromTextArea} disabled={!isPending} />}
    {isOpen && <Button onClick={submit} disabled={isPending}>Submit</Button>}
  </>;
}