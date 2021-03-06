﻿
using Newtonsoft.Json;
using PetaPoco;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;

namespace WebService.Controllers
{
    public class HomeController : Controller
    {
        private string GetJsonString()
        {
            string postStr = string.Empty;
            Stream inputStream = Request.InputStream;
            int contentLength = Request.ContentLength;
            int offset = 0;
            if (contentLength > 0)
            {
                byte[] buffer = new byte[contentLength];
                for (int i = inputStream.Read(buffer, offset, contentLength - offset); i > 0; i = inputStream.Read(buffer, offset, contentLength - offset))
                {
                    offset += i;
                }
                UTF8Encoding encoding = new UTF8Encoding();
                postStr = encoding.GetString(buffer);
            }
            return postStr;
        }
        static FileLog runLog = new FileLog(AppDomain.CurrentDomain.BaseDirectory + @"/log/runLog.txt");
        MqttClient mqttClient = new MqttClient("message.deviceiot.top", 61613, false, MqttSslProtocols.None, null, null);
        [HttpPost]
        public JsonResult Post( )
        {
            var json =GetJsonString();
            var reqObj = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongRequest>(json);


            var toDingDongServer = new DingDongResponse();
            toDingDongServer.versionid = "1.0";
            toDingDongServer.is_end = true;
            toDingDongServer.sequence = reqObj.sequence;
            toDingDongServer.timestamp = (DateTime.Now.ToUniversalTime().Ticks - 621355968000000000) / 10000;
            toDingDongServer.directive = new Directive();
            string clientId = "Server_" + Guid.NewGuid().ToString();
            mqttClient.Connect(clientId, "admin", "passwordpassword");//, client.BaiDuYunName, client.BaiDuYunPwd
            if (reqObj.session.attributes.ToString().IndexOf("大灯")>1)
            {

                mqttClient.Publish("wyj", Encoding.UTF8.GetBytes("0"), MqttMsgBase.QOS_LEVEL_AT_MOST_ONCE, false);
            }
            if (reqObj.session.attributes.ToString().IndexOf("餐灯") > 1)
            {
                mqttClient.Publish("wyj", Encoding.UTF8.GetBytes("0"), MqttMsgBase.QOS_LEVEL_AT_MOST_ONCE, false);
            }
            if (reqObj.session.attributes.ToString().IndexOf("落地灯") > 1)
            {
                mqttClient.Publish("wyj", Encoding.UTF8.GetBytes("0"), MqttMsgBase.QOS_LEVEL_AT_MOST_ONCE, false);
            }



            Directive_items item = new Directive_items();
                item.content = "已启动指令";
                item.type = "1";
                toDingDongServer.directive = new Directive();
                toDingDongServer.directive.directive_items = new List<Directive_items>();
                toDingDongServer.directive.directive_items.Add(item);


            return  Json(toDingDongServer,JsonRequestBehavior.AllowGet);
        }

        

        public ActionResult UserProfile(string state)
        {
            state = state.Replace(" ", "+");
            var json = Decrypt(state, _key);
            var entity = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongOpenRequest>(json);
            ViewBag.userId = entity.userid;
            return View();
        }
        
        

        [HttpPost]
        public JsonResult UserProfile(string userId,string phone)
        {

            Database db = new Database("Db");
            db.BeginTransaction();
            string sqlCheck = string.Format("Select count(0) from DingDongCall_User where DingDongUserId='{0}'", userId);
            var first = db.ExecuteScalar<int>(sqlCheck);
            string sqlUserToDo = string.Empty;
            if (first == 0)
            {
                //新增
                sqlUserToDo = string.Format("Insert into DingDongCall_User (DingDongUserId,Inputtime,status,CallPhone='{0}') values ('{1}',getdate(),'{2}')",phone, userId, "create");
            }
            else
            {
                sqlUserToDo = string.Format("Update DingDongCall_User set CallPhone='{0}'  where DingDongUserId='{1}'",phone, userId);
            }
            try
            {

                db.Execute(sqlUserToDo);
                db.CompleteTransaction();
                return Json(new { State = true, Msg = ""}, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                db.AbortTransaction();
                return Json(new { State = false, Msg = e.Message }, JsonRequestBehavior.AllowGet);
            }
            
        }
        private static byte[] _key = Convert.FromBase64String(@"uw4FGrtauRGbh2ukh2ZFAA ==");
        private static string Decrypt(string toDecrypt, byte[] key)
        {
            byte[] keyArray = key;
            byte[] inputBuffer = Convert.FromBase64String(toDecrypt);
            RijndaelManaged rDel = new RijndaelManaged();
            rDel.Key = keyArray;
            rDel.Mode = CipherMode.ECB;
            rDel.Padding = PaddingMode.PKCS7;
            ICryptoTransform cTransform = rDel.CreateDecryptor();

            byte[] resultArray = cTransform.TransformFinalBlock(inputBuffer, 0, inputBuffer.Length);

            return Encoding.UTF8.GetString(resultArray);
        }
        public ContentResult OpenService(string state)
        {
            state = state.Replace(" ", "+");
            var json = Decrypt(state, _key);
            var entity = Newtonsoft.Json.JsonConvert.DeserializeObject<DingDongOpenRequest>(json);
            Database db = new Database("Db");
            db.BeginTransaction();
            string sqlCheck = string.Format("Select count(0) from DingDongCall_User where DingDongUserId='{0}'", entity.userid);
            var first = db.ExecuteScalar<int>(sqlCheck);
            string sqlUserToDo = string.Empty;
            if (first == 0)
            {
                //新增
                sqlUserToDo = string.Format("Insert into DingDongCall_User (DingDongUserId,Inputtime,status) values ('{0}',getdate(),'{1}')", entity.userid, entity.operation);
            }
            else
            {
                sqlUserToDo = string.Format("Update DingDongCall_User set status='{0}',InputTime=getdate() where DingDongUserId='{1}'", entity.operation, entity.userid);
            }
            try
            {

                db.Execute(sqlUserToDo);
                db.CompleteTransaction();
                return Content("0");
            }
            catch (Exception e)
            {
                db.AbortTransaction();
                return Content("1");
            }
        }

        public static string MD5Encrypt(string strText)
        {
            MD5 md5 = System.Security.Cryptography.MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(strText);
            byte[] hashBytes = md5.ComputeHash(inputBytes);

            // Convert the byte array to hexadecimal string
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("X2"));
                // To force the hex string to lower-case letters instead of
                // upper-case, use he following line instead:
                // sb.Append(hashBytes[i].ToString("x2")); 
            }
            return sb.ToString();

        }

        public ActionResult About()
        {
            string jsonData = "{\"action\":\"callDailBack\",\"src\":\"" + "13679058245" + "\",\"dst\":\"" + "01053189990" + "\",\"appid\":\"" + appID + "\",\"credit\":\"" + "10" + "\"}";
            //2、云通信平台接口请求URL
            string url = "/call/DailbackCall.wx";
            //3、发送http请求，接收返回错误消息
            ViewBag.Message = CommenHelper.SendRequest(url, jsonData);

            return View("");
        }
        public string appID = "f2b12256cb0f43c0bac79c93656a8805";
        public string UniconToString(string str)
        {
            string outStr = "";
            if (!string.IsNullOrEmpty(str))
            {
                string[] strlist = str.Replace("\\", "").Split('u');
                try
                {
                    for (int i = 1; i < strlist.Length; i++)
                    {
                        //将unicode字符转为10进制整数，然后转为char中文字符
                        outStr += (char)int.Parse(strlist[i], System.Globalization.NumberStyles.HexNumber);
                    }
                }
                catch (FormatException ex)
                {
                    outStr = ex.Message;
                }
            }
            return outStr;
        }
    }
}