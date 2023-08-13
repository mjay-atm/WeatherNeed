import gradio as gr
import os
import openai
import tiktoken
from dotenv import load_dotenv  # install python_dotenv
from utils import city_report, taiwan_report, load_topic


############ env setting ####################################
load_dotenv()
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
WEATHER_API_KEY = os.environ["WEATHER_API_KEY"]
openai.api_key = OPENAI_API_KEY
#encoding = tiktoken.get_encoding("cl100k_base")
encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
#tokens_count = len(encoding.encode(system_message))
choosen_engine = "gpt-35-turbo"
normal_conversation_history = []
#BASE_URL = os.environ["OPENAI_API_BASE"]
#openai.api_type = "azure"
#openai.api_base = BASE_URL
#openai.api_version = "2023-05-15"
#############################################################


############ load city information ##########################
save_dir = '小幫手資料'
topic_dir = 'topic'
no_list = [str(i).zfill(3) for i in range(9, 31)]
dic_city2no = {}
with open(f'city_list.txt', 'r') as f:
    for i, city in enumerate(f.readlines()):
        dic_city2no[city.replace("\n", "")] = no_list[i]
#############################################################


def generate_response(prompt, chat_history):
    #global conversation_history
    system_message = "I'm WeatherNeed, and use traditional chinese to response every question."
    
    normal_conversation_history.append({"role": "system", "content": system_message})
    normal_conversation_history.append({"role": "user", "content": prompt})
    print(normal_conversation_history)
    completions = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        # engine=choosen_engine,
        temperature=0.2,
        messages=normal_conversation_history
    )
    response = completions.choices[0].message.content
    #conversation_history.pop(-1)
    normal_conversation_history.append({"role": "assistant", "content": response})
    # global tokens_count
    # tokens_count = tokens_count + len(encoding.encode(prompt + response))
    chat_history.append((prompt, response.strip()))
    #print(chat_history)
    return "", chat_history


def generate_city_report(city_choose1, chat_history):
    #global conversation_history
    conversation_history = []
    r1 = city_report(WEATHER_API_KEY, save_dir, city_choose1, dic_city2no)
    system_message = f"""
    I'm WeatherNeed, and following was the weather report today:
    1. weather report of {city_choose1} (a city in Taiwan): {r1}
    """
    conversation_history.append({"role": "system", "content": system_message})
    prompt = "If you are a weather analyst, please summarize today's report in traditional Chinese within 20 words based on the given report, and keep only qualitative descriptions and no quantitative data."
    conversation_history.append({"role": "user", "content": prompt})
    print(conversation_history)
    completions = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        # engine=choosen_engine,
        temperature=0.2,
        messages=conversation_history
    )
    response = completions.choices[0].message.content
    #conversation_history.pop(-1)
    #conversation_history.append({"role": "assistant", "content": response})
    # global tokens_count
    # tokens_count = tokens_count + len(encoding.encode(prompt + response))
    chat_history.append((city_choose1, response.strip()))
    #print(chat_history)
    return "", chat_history


def generate_taiwan_report(city_choose1, chat_history):
    #global conversation_history
    conversation_history = []
    r1 = city_report(WEATHER_API_KEY, save_dir, city_choose1, dic_city2no)
    r2 = taiwan_report(WEATHER_API_KEY, save_dir)
    r2 = r2.replace(u"\u3000", "")
    r2 = r2.replace("\r\n", "")
    r2 = r2.replace("\n", "")
    system_message = f"""
    I'm WeatherNeed, and following were the weather reports today:
    1. weather report of {city_choose1} (a city in Taiwan): {r1}
    2. weather report of 臺灣: {r2} 
    """
    conversation_history.append({"role": "system", "content": system_message})
    prompt = "If you are a weather analyst, please summarize today's report in traditional Chinese within 50 words based on the given reports, and keep only qualitative descriptions and no quantitative data."
    conversation_history.append({"role": "user", "content": prompt})
    print(conversation_history)
    completions = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        # engine=choosen_engine,
        temperature=0.2,
        messages=conversation_history
    )
    response = completions.choices[0].message.content
    #conversation_history.pop(-1)
    #conversation_history.append({"role": "assistant", "content": response})
    # global tokens_count
    # tokens_count = tokens_count + len(encoding.encode(prompt + response))
    chat_history.append((city_choose1+" + 全臺", response.strip()))
    #print(chat_history)
    return "", chat_history


def generate_lifetopic_report(city_choose2, topic_choose, chat_history):
    #global conversation_history
    conversation_history = []
    r1 = city_report(WEATHER_API_KEY, save_dir, city_choose2, dic_city2no)
    topic_question = load_topic(topic_choose, topic_dir)
    system_message = f"""
    I'm WeatherNeed, and following was the weather report today:
    1. weather report of {city_choose2} (a city in Taiwan): {r1}
    2. 「食」、「衣」、「住」、「行」、「教育」、「樂」，是人類生活的六大面向
    """
    conversation_history.append({"role": "system", "content": system_message})
    prompt = f"""
    {topic_question}
    According to today's {city_choose2}'s weather report, come up with three questions about "{topic_choose}" that are sufficiently different from each other,
    and you mustn't copy the example questions. Then answer them in the following format:
    根據{city_choose2}今天的天氣資訊，以下是三個關於「{topic_choose}」的問題以及相應的回答：
    1.問題：
      答案：
    2.問題：
      答案：
    3.問題：
      答案：
    """
    conversation_history.append({"role": "user", "content": prompt})
    print(conversation_history)
    completions = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        # engine=choosen_engine,
        temperature=0.5,
        messages=conversation_history
    )
    response = completions.choices[0].message.content
    #conversation_history.pop(-1)
    #conversation_history.append({"role": "assistant", "content": response})
    # global tokens_count
    # tokens_count = tokens_count + len(encoding.encode(prompt + response))
    chat_history.append((city_choose2 + "的「" + topic_choose + "」生活主題", response.strip()))
    #print(chat_history)
    return "", chat_history


# def calc_tokens():
#     return tokens_count


def update_model(llm_model):
    global choosen_engine
    choosen_engine = llm_model


if __name__ == '__main__':
       
    css = """
    #chatbot .user {
        text-align: right
    }
    """

    with gr.Blocks(css=css) as demo:
        chatgpt = gr.Chatbot(
            value=[["你是誰?", "您好, 我是WeatherNeed, 是你最實用的天氣小助手 !"]], elem_id="chatbot")

        with gr.Row():
            with gr.Column(scale=1):
                # radio = gr.Radio(
                #     choices=["gpt-3.5-turbo", "gpt-4"], value="gpt-3.5-turbo", label='ChatGPT 模型')
                #radio1 = gr.Radio(choices = ["Tom Hanks","Dalai Lama","Dolly Parton"], value = "Tom Hanks",label='服務性格')
                with gr.Tab("WeatherGPT"):
                    city_choose1 = gr.Dropdown(choices = dic_city2no.keys(), label="選擇您想查詢的城市", value="台北市")
                    btn1 = gr.Button("生成「城市」的天氣資訊")
                    btn2 = gr.Button("生成「城市+全臺」的天氣資訊")
                
                # cost_view = gr.Textbox(
                #     label='Tokens 數計算',
                #     value=0
                # )
                # .then(calc_tokens, outputs=cost_view)
                    
            with gr.Column(scale=2.5):
                with gr.Tab("六大生活主題"):
                    city_choose2 = gr.Dropdown(choices = dic_city2no.keys(), label="選擇您想查詢的城市", value="台北市")
                    topic_choose = gr.Radio(["食", "衣", "住", "行", "育", "樂"], label="選擇您想知道的生活主題", value="食")
                    btn3 = gr.Button("根據「城市」的天氣資訊，生成「生活主題」的問題和答案")
             
            with gr.Column(scale=3):
                txt = gr.Textbox(
                    label="輸入與ChatGPT 交談之文字"
                )

        # radio.change(update_model, radio, [])
        txt.submit(generate_response, inputs=[txt, chatgpt], outputs=[
                txt, chatgpt])
        btn1.click(generate_city_report, inputs=[city_choose1, chatgpt], outputs=[
                txt, chatgpt])
        btn2.click(generate_taiwan_report, inputs=[city_choose1, chatgpt], outputs=[
                txt, chatgpt])
        btn3.click(generate_lifetopic_report, inputs=[city_choose2, topic_choose, chatgpt], outputs=[
                txt, chatgpt])

    demo.launch()
