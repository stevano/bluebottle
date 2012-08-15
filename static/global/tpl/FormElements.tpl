<h3><%= item.name %></h3>
<% if (item.type == 'text') { %>
	<input name="<%= item.filter %>" type="text" />
<% } %> 

<% if (item.type == 'select') { %>
	<select name="<%= item.filter %>">
		<option value="">- all - </option>
		<% _.each(item.options, function(option) { %>
			<option value="<%= option.name %>">
				<%= option.title %> [<%= option.count %>]<br/>
			</option>
		<% }) %>
	</select>
<% } %> 

<% if (item.type == 'checkbox') { %>
	<% _.each(item.options, function(option) { %>
		<input type="checkbox" id="cb_<%= item.name %>_<%= option.name %>" name="<%= item.name %>" value="<%= option.name %>"   />
		<label for="cb_<%= item.name %>_<%= option.name %>">
			<b><%= option.title %></b> (<%= option.count %>)
		</label><br/>
	<% }) %>
<% } %>
