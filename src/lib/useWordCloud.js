"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function useWordCloud() {
    const [words, setWords] = useState([]);

    // 1) Cargar palabras al inicio
    useEffect(() => {
        loadWords();
    }, []);

    async function loadWords() {
        const { data } = await supabase
            .from("wordcloud")
            .select("*")
            .order("value", { ascending: false });
        setWords(data || []);
    }

    // 2) Actualizar en tiempo real
    useEffect(() => {
        const channel = supabase
            .channel("wordcloud-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "wordcloud" },
                () => {
                    loadWords();
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    // 3) Función para agregar palabra
    async function addWord(word) {
        await supabase.rpc("add_word", { new_word: word });
    }

    return { words, addWord };
}
