import speech_recognition as sr
from gtts import gTTS
from playsound import playsound
import os 
import time

class VoiceClass:
    def __init__(self):
        self.orders_keywords = ['baixar', 'processo', 'pdf', 'pesquisar']
        self.quit_keywords = ['sair', 'encerrar', 'parar', 'fechar']
        self.quit = False
        self.return_item = []

        self.loop()

    def listen_microphone(self):
        microphone = sr.Recognizer()
        with sr.Microphone() as source:
            print("Ouvindo...")
            # cancela ruido
            microphone.adjust_for_ambient_noise(source)

            # executa a fala de introdução
            # path = os.path.abspath(os.path.join('default_audios', 'talk.mp3')) mac ou linux
            path = os.path.join('default_audios', 'talk.mp3') # windows
            # substitui espaços por %20 em dispositivos mac
            new_path = path.replace(" ", "%20")
            # reproduz o audio
            playsound(new_path)

            # reconhece a fala
            audio = microphone.listen(source)

        try:
            # envia para o google cloud para reconhecimento de fala 
            text = microphone.recognize_google(audio, language='pt-BR')
        except sr.UnknownValueError:
            # executa fala de erro de busca
            # path = os.path.abspath(os.path.join('default_audios', 'talk.mp3')) mac ou linux
            path = os.path.join('default_audios', 'error.mp3') # windows
            new_path = path.replace(" ", "%20")
            playsound(new_path)
            os.remove('last_command.mp3')
            time.sleep(3)
            return self.listen_microphone()

        return text

    # reproduz o audio a partir de um texto
    def play_audio(self, txt, file='last_command.mp3'):
        tts = gTTS(txt, lang='pt-br')
        time.sleep(1)

        try:
            tts.save(file)
        except:
            print("Erro ao salvar o audio")

        path = os.path.abspath(file)
        path = path.replace(" ", "%20")
        playsound(path)

    def loop(self, txt=""):
        txt = txt + ' ' + self.listen_microphone()
        if any(keyword in txt for keyword in self.orders_keywords):
            if not "config_path" in txt:
                self.play_audio('Qual o processo que você deseja baixar?', 'processo.mp3')
                return self.loop(f'config_path {txt}') # path ja configurado
            if any(keyword in txt for keyword in ['um', '1']):
                self.return_item = ['padrao', 1]
                self.play_audio('Você iniciou o processo 1')
                print('pedido 1')
            if any(keyword in txt for keyword in ['dois', '2']):
                self.return_item = ['padrao', 2]
                self.play_audio('Você iniciou o processo 2')
                print('pedido 2')
            if any(keyword in txt for keyword in ['três', '3']):
                self.return_item = ['padrao', 3]
                self.play_audio('Você iniciou o processo 3')
                print('pedido 3')
            if any(keyword in txt for keyword in ['quatro', '4']):
                self.return_item = ['padrao', 4]
                self.play_audio('Você iniciou o processo 4')
                print('pedido 4')
            pass

        elif any(keyword in txt for keyword in self.quit_keywords):
            self.quit = True
        else:
            print('pedido não reconhecido')
            return self.listen_microphone()

amanda = VoiceClass()

