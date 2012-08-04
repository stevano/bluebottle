<h3><%= item[0] %></h3>

<% if (item[1].type == 'text') { %>
	<input name="<%= item[1].filter %>" type="text" />
<% } %> 

<% if (item[1].type == 'select') { %>
	<select name="<%= item[1].filter %>">
		<option value="">- all - </option>
		<% _.each(eval(item[1].options), function(option) { %>
			<option value="<%= option[0] %>">
				<%= option[1] %> (<%= option[2] %>)<br/>
			</option>
		<% }) %>
	</select>
<% } %> 

<% if (item[1].type == 'checkbox') { %>
	<% _.each(eval(item[1].options), function(option) { %>
		<input type="checkbox" id="cb_<%= item[1].name %>_<%= option[0] %>" name="<%= item[1].name %>[]" value="<%= option[1] %>"   />
		<label for="cb_<%= item[1].name %>_<%= option[0] %>">
			<b><%= option[0] %></b> (<%= option[2] %>)
		</label><br/>
	<% }) %>
<% } %>
